import React, { useState } from 'react';
import { CustomerData } from '../types';

interface Props {
  formData: CustomerData;
  updateFormData: (data: Partial<CustomerData>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const Step3: React.FC<Props> = ({ formData, updateFormData, onSubmit, onBack }) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Get today's date for validation (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ driversLicense: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation requires document, proof of income confirmation AND LGPD terms acceptance
  const isSubmittable = formData.driversLicense !== null && formData.hasProofOfIncome && formData.hasAcceptedTerms;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-700 text-center">Verificação e Agendamento</h2>
      <p className="text-center text-gray-500 mb-6">Para sua segurança e a dos proprietários, conclua estas etapas.</p>
      
      <div className="flex items-center space-x-4 p-4 border-l-4 border-red-400 bg-red-50">
        <i className="fas fa-shield-alt text-red-500 text-2xl"></i>
        <p className="text-sm text-red-700">Por motivos de segurança, o envio de um documento de identificação (CNH ou RG) com foto é obrigatório para prosseguir com o agendamento.</p>
      </div>

      <div>
        <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center px-4 py-6 bg-white text-blue-600 rounded-lg shadow-md tracking-wide uppercase border-2 border-dashed border-gray-300 cursor-pointer hover:bg-blue-50 hover:text-blue-700">
          <i className="fas fa-cloud-upload-alt text-3xl"></i>
          <span className="mt-2 text-base leading-normal">{formData.driversLicense ? formData.driversLicense.name : "Anexar CNH ou Documento"}</span>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
        </label>
        {filePreview && (
          <div className="mt-4 text-center">
            <img src={filePreview} alt="Pré-visualização do documento" className="max-h-48 mx-auto rounded-lg shadow-lg" />
            <button
              onClick={() => {
                setFilePreview(null);
                updateFormData({ driversLicense: null });
                (document.getElementById('file-upload') as HTMLInputElement).value = '';
              }}
              className="mt-2 text-sm text-red-500 hover:text-red-700"
            >
              Remover
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-center p-3 rounded-md bg-gray-50 border">
        <input
          type="checkbox"
          id="hasProofOfIncome"
          checked={formData.hasProofOfIncome}
          onChange={(e) => updateFormData({ hasProofOfIncome: e.target.checked })}
          className="h-5 w-5 text-[#0a192f] border-gray-300 rounded focus:ring-[#0a192f]"
        />
        <label htmlFor="hasProofOfIncome" className="ml-3 block text-sm text-gray-900">
          Possuo comprovante de renda para apresentar, se necessário.
        </label>
      </div>

      <div className="pt-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 text-center">Sugestão de Datas para Visita</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <fieldset className="p-3 border rounded-lg">
              <legend className="px-2 font-medium text-sm text-gray-600">Opção 1</legend>
              <div className="flex gap-2">
                <input type="date" min={today} value={formData.visitDate1} onChange={e => updateFormData({ visitDate1: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" required/>
                <input type="time" value={formData.visitTime1} onChange={e => updateFormData({ visitTime1: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" required/>
              </div>
            </fieldset>
             <fieldset className="p-3 border rounded-lg">
              <legend className="px-2 font-medium text-sm text-gray-600">Opção 2</legend>
              <div className="flex gap-2">
                <input type="date" min={today} value={formData.visitDate2} onChange={e => updateFormData({ visitDate2: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" required/>
                <input type="time" value={formData.visitTime2} onChange={e => updateFormData({ visitTime2: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" required/>
              </div>
            </fieldset>
        </div>
      </div>
      
      {/* LGPD Consent */}
      <div className="flex items-start p-4 rounded-md bg-gray-50 border border-gray-200 mt-4">
        <div className="flex items-center h-5">
            <input
            type="checkbox"
            id="hasAcceptedTerms"
            checked={formData.hasAcceptedTerms}
            onChange={(e) => updateFormData({ hasAcceptedTerms: e.target.checked })}
            className="h-5 w-5 text-[#0a192f] border-gray-300 rounded focus:ring-[#0a192f]"
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor="hasAcceptedTerms" className="font-medium text-gray-900">Concordo com os Termos e Privacidade</label>
            <p className="text-gray-500 text-xs mt-1">
                Autorizo a <strong>Godoy Prime Realty</strong> a utilizar meus dados para fins de agendamento e análise de perfil, em conformidade com a Lei Geral de Proteção de Dados (LGPD). Seus dados são confidenciais.
            </p>
        </div>
      </div>


      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-transform transform hover:scale-105"
        >
          <i className="fas fa-arrow-left mr-2"></i> Voltar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isSubmittable}
          title={!isSubmittable ? "Preencha todos os campos obrigatórios e aceite os termos" : "Enviar Agendamento"}
          className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 shadow-lg"
        >
          <i className="fas fa-paper-plane mr-2"></i> Enviar
        </button>
      </div>
    </div>
  );
};

export default Step3;