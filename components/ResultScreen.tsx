import React from 'react';

interface Props {
  error: string | null;
  customerName: string;
  customerEmail: string;
  onRestart: () => void;
}

const ResultScreen: React.FC<Props> = ({ error, onRestart, customerName, customerEmail }) => {
  if (error) {
    return (
      <div className="text-center p-8 animate-fade-in min-h-[400px] flex flex-col justify-center items-center">
        <i className="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <h2 className="text-2xl font-semibold text-gray-800">Erro no Envio</h2>
        <p className="text-gray-600 mt-2 mb-6">{error}</p>
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-[#0a192f] text-white font-bold rounded-lg hover:bg-blue-900 transition-transform transform hover:scale-105"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }
  
  const whatsappMessage = `Olá, sou ${customerName}. Acabei de realizar o pré-cadastro para agendamento de visita e gostaria de confirmar o recebimento.`;
  const whatsappLink = `https://wa.me/5521964075124?text=${encodeURIComponent(whatsappMessage)}`;

  const emailSubject = "Confirmação de Cadastro - Godoy Prime Realty";
  const emailBody = `Olá ${customerName},\n\nEm nome da Godoy Prime Realty, agradecemos seu interesse e o envio do seu cadastro.\n\nSolicitamos aguardar o contato do Consultor responsável para confirmação do agendamento.\n\nAtenciosamente,\nGodoy Prime Realty`;
  const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[400px] text-center animate-fade-in">
      <div className="w-20 h-20 bg-[#0a192f] rounded-full flex items-center justify-center mb-6 shadow-lg">
         <i className="fas fa-check text-[#c5a059] text-4xl"></i>
      </div>
      
      <h2 className="text-2xl font-bold text-[#0a192f] mb-4">Cadastro Recebido</h2>
      
      <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-[#c5a059] max-w-lg text-left shadow-sm">
        <p className="text-gray-700 italic mb-4">
          "Olá, <strong>{customerName}</strong>.
        </p>
        <p className="text-gray-700 italic mb-4">
          Em nome da <strong>Godoy Prime Realty</strong>, agradecemos o interesse e o envio do cadastro.
        </p>
        <p className="text-gray-700 italic">
          Solicitamos aguardar o contato do Consultor responsável para confirmação do agendamento."
        </p>
      </div>

      <p className="text-gray-500 mt-6 text-sm">
        Uma confirmação foi gerada para <strong>{customerEmail}</strong>.
      </p>

      <div className="flex flex-col gap-3 mt-8 w-full max-w-sm">
        <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#25D366] text-white font-bold rounded-lg hover:bg-[#128C7E] transition-transform transform hover:scale-105 shadow-md flex items-center justify-center"
        >
            <i className="fab fa-whatsapp mr-2 text-xl"></i> Contatar no WhatsApp
        </a>

        <a 
            href={mailtoLink} 
            className="px-6 py-3 bg-[#0a192f] text-white font-bold rounded-lg hover:bg-blue-900 transition-transform transform hover:scale-105 shadow-md flex items-center justify-center"
        >
            <i className="fas fa-envelope mr-2 text-xl"></i> Receber Confirmação por E-mail
        </a>
        
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all mt-2"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;