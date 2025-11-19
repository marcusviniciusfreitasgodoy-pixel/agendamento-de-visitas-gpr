import React from 'react';
import { CustomerData } from '../types';

interface Props {
  formData: CustomerData;
  updateFormData: (data: Partial<CustomerData>) => void;
  onNext: () => void;
}

const Step1: React.FC<Props> = ({ formData, updateFormData, onNext }) => {
  const isFormValid = formData.fullName.trim() !== '' && formData.email.includes('@') && formData.phone.length > 9;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-700 text-center">Informações Pessoais</h2>
      <p className="text-center text-gray-500 mb-6">Comece preenchendo seus dados de contato.</p>
      
      <div className="flex items-start space-x-4 p-4 border-l-4 border-blue-400 bg-blue-50 rounded-lg">
        <i className="fas fa-info-circle text-blue-500 text-xl mt-1"></i>
        <p className="text-sm text-blue-800">
          Para garantir a segurança de todos e otimizar sua experiência, solicitamos algumas informações para o agendamento. Seus dados são protegidos pela LGPD. O envio do documento de identificação ao final é obrigatório.
        </p>
      </div>

      <div className="relative">
        <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          type="text"
          placeholder="Nome Completo"
          value={formData.fullName}
          onChange={(e) => updateFormData({ fullName: e.target.value })}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />
      </div>
      
      <div className="relative">
        <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          type="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />
      </div>
      
      <div className="relative">
        <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          type="tel"
          placeholder="Telefone (com DDD)"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value.replace(/\D/g, '') })}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isFormValid}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
        >
          Avançar <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </form>
  );
};

export default Step1;
