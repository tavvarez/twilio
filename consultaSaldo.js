const axios = require('axios');
const twilio = require('twilio');

exports.handler = async (context, event, callback) => {
  // Cria um objeto de resposta
  const twiml = new twilio.twiml.MessagingResponse();

  try {
    // Usa o CGC vindo do JSON para buscar o user
    const response = await axios.get('your api');

    const codRetorno = response.data.codeReturn;
    const conteudo = response.data.content;

    console.log(codRetorno);
    //Valida se conseguiu fazer a requisição
    if (codRetorno == 200 || codRetorno == '200'){

      //Valida o retorno para saber se tem informações
      if (conteudo.length > 0) {
        let somaSaldo = 0;
        let somaPago = 0;
        let nomeMotora;
          for (var i = 0; i < conteudo.length; i++) {
              const linhaTemp = JSON.stringify(conteudo[i]);
              const linhaObjeto = JSON.parse(linhaTemp);

              nomeMotora = linhaObjeto.DA4_NOME;

              //Vou trazer somente os pagamentos a receber
              if (linhaObjeto.STATUS == 'RECEBER'){
                  somaSaldo += linhaObjeto.TOTAL_SALDO;
              }
              if (linhaObjeto.STATUS == 'PAGO'){
                  somaPago += linhaObjeto.TOTAL_FRETE;
              }
          }
          //Vou imprimir cada linha de retorno da API
          if (somaSaldo > 0){
            const valorCerto = somaSaldo.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
            //Vou imprimir mensagem do saldo
            twiml.message("Falaaaaa " + nomeMotora + " tudo bem? Localizamos seu saldo e ele é de " + valorCerto);
          }
          if (somaSaldo > 0){
            //Vou imprimir mensagem do saldo
            twiml.message(". Para " + nomeMotora + ", o total já pago foi de R$ " + somaPago + ". Tá liberado para curtir o find!"); 
          }
      } else {
        //Retorna mensagem dizendo que não retornou nada
        twiml.message("Desculpe. Não encontramos registros para as informações fornecidas")
      }
    }
    
    // Return the final TwiML as the second argument to `callback`
    // This will render the response as XML in reply to the webhook request
    // and result in the message being played back to the user
    return callback(null, twiml.toString().replace(/<\/?[^>]+(>|$)/g, ""));
  } catch (error) {
    // In the event of an error, return a 500 error and the error message
    console.error(error);
    return callback(error);
  }
};