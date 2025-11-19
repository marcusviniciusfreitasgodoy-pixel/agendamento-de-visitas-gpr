import React from 'react';
import { CustomerData } from '../types';
import LocationAgent from './LocationAgent';

interface Props {
  formData: CustomerData;
  updateFormData: (data: Partial<CustomerData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2: React.FC<Props> = ({ formData, updateFormData, onNext, onBack }) => {
  // Validation logic based on payment method
  const isFinancingValid = formData.paymentMethod === 'financiamento' 
    ? (formData.financingAmount && formData.financingAmount.trim() !== '') 
    : true;

  const isTradeInValid = formData.paymentMethod === 'permuta'
    ? (formData.tradeInPropertyValue && formData.tradeInType && formData.tradeInBedrooms && formData.tradeInSize && formData.tradeInNeighborhood && formData.tradeInAddress)
    : true;

  const isFormValid = formData.propertyIdentifier.trim() !== '' && formData.familyMonthlyIncome.trim() !== '' && isFinancingValid && isTradeInValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext();
    }
  };
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Pick<CustomerData, 'familyMonthlyIncome' | 'financingAmount' | 'tradeInPropertyValue'>) => {
    const value = e.target.value.replace(/[^0-9,.]/g, '');
    updateFormData({ [field]: value });
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-700 text-center">Imóvel e Perfil Financeiro</h2>
      <p className="text-center text-gray-500 mb-6">Identifique o imóvel desejado e seus dados financeiros.</p>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <label className="block text-sm font-bold text-[#0a192f] mb-2">Qual imóvel você deseja visitar?</label>
          <div className="relative">
             <i className="fas fa-home absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
             <input
              type="text"
              placeholder="Código do Imóvel, Link ou Descrição (Ex: CO1234)"
              value={formData.propertyIdentifier}
              onChange={(e) => updateFormData({ propertyIdentifier: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a192f] focus:border-[#0a192f] transition bg-white text-gray-900"
              required
            />
          </div>
          {/* Agent to provide Location Intelligence */}
          <LocationAgent propertyIdentifier={formData.propertyIdentifier} />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Renda Mensal Familiar</label>
        <span className="absolute left-4 top-[2.4rem] text-gray-300 font-semibold z-10">R$</span>
        <input
          type="text"
          placeholder="Ex: 50.000,00"
          value={formData.familyMonthlyIncome}
          onChange={(e) => handleCurrencyChange(e, 'familyMonthlyIncome')}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a059] focus:border-[#c5a059] transition bg-[#0a192f] text-white placeholder-gray-400 shadow-inner"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Imóvel de Interesse (Categoria)</label>
        <select
          value={formData.propertyOfInterest}
          onChange={(e) => updateFormData({ propertyOfInterest: e.target.value as CustomerData['propertyOfInterest'] })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a192f] focus:border-[#0a192f] transition bg-white text-gray-900"
        >
          <option value="cobertura">Cobertura</option>
          <option value="casa">Casa em Condomínio</option>
          <option value="apartamento_tipo">Apartamento Tipo</option>
          <option value="terreno">Terreno</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento Pretendida</label>
        <select
          value={formData.paymentMethod}
          onChange={(e) => updateFormData({ paymentMethod: e.target.value as CustomerData['paymentMethod'] })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a192f] focus:border-[#0a192f] transition bg-white text-gray-900"
        >
          <option value="financiamento">Financiamento Bancário</option>
          <option value="a_vista">À Vista</option>
          <option value="permuta">Permuta de Imóvel</option>
        </select>
      </div>

      {formData.paymentMethod === 'financiamento' && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-4 animate-fade-in">
           <h3 className="font-semibold text-[#0a192f]">Detalhes do Financiamento</h3>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-semibold z-10">R$</span>
                <input 
                  type="text" 
                  placeholder="Valor a ser financiado" 
                  value={formData.financingAmount || ''} 
                  onChange={(e) => handleCurrencyChange(e, 'financingAmount')} 
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#c5a059] focus:border-[#c5a059] bg-[#0a192f] text-white placeholder-gray-400 shadow-inner"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Possui crédito pré-aprovado?</label>
                <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer text-gray-800 font-medium">
                        <input type="radio" name="preApproved" value="sim" checked={formData.hasPreApprovedCredit === 'sim'} onChange={(e) => updateFormData({ hasPreApprovedCredit: e.target.value as 'sim' | 'nao' })} className="h-5 w-5 text-[#0a192f] focus:ring-[#0a192f]"/> 
                        <span className="ml-2">Sim</span>
                    </label>
                    <label className="flex items-center cursor-pointer text-gray-800 font-medium">
                        <input type="radio" name="preApproved" value="nao" checked={formData.hasPreApprovedCredit === 'nao'} onChange={(e) => updateFormData({ hasPreApprovedCredit: e.target.value as 'sim' | 'nao' })} className="h-5 w-5 text-[#0a192f] focus:ring-[#0a192f]"/> 
                        <span className="ml-2">Não</span>
                    </label>
                </div>
            </div>
            <input 
              type="text" 
              placeholder="Qual a instituição financeira? (Opcional)" 
              value={formData.financialInstitution || ''} 
              onChange={(e) => updateFormData({ financialInstitution: e.target.value })} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#c5a059] focus:border-[#c5a059] bg-[#0a192f] text-white placeholder-gray-400 shadow-inner"
            />
        </div>
      )}

      {formData.paymentMethod === 'permuta' && (
         <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg space-y-4 animate-fade-in">
           <h3 className="font-semibold text-[#0a192f]">Detalhes da Permuta</h3>
            
            {/* Valor */}
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                <input type="text" placeholder="Valor estimado do imóvel" value={formData.tradeInPropertyValue || ''} onChange={(e) => handleCurrencyChange(e, 'tradeInPropertyValue')} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#c5a059] focus:border-[#c5a059] text-gray-900"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Tipo */}
                <select value={formData.tradeInType || ''} onChange={(e) => updateFormData({ tradeInType: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-[#c5a059] focus:border-[#c5a059] bg-white text-gray-900">
                    <option value="" disabled>Tipo de Imóvel</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Cobertura">Cobertura</option>
                    <option value="Casa">Casa</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Comercial">Comercial</option>
                </select>
                
                {/* Quartos */}
                <select value={formData.tradeInBedrooms || ''} onChange={(e) => updateFormData({ tradeInBedrooms: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-[#c5a059] focus:border-[#c5a059] bg-white text-gray-900">
                    <option value="" disabled>Quartos</option>
                    <option value="1">1 Quarto</option>
                    <option value="2">2 Quartos</option>
                    <option value="3">3 Quartos</option>
                    <option value="4">4+ Quartos</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 {/* Tamanho */}
                <select value={formData.tradeInSize || ''} onChange={(e) => updateFormData({ tradeInSize: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-[#c5a059] focus:border-[#c5a059] bg-white text-gray-900">
                    <option value="" disabled>Tamanho (m²)</option>
                    <option value="ate_60">Até 60m²</option>
                    <option value="60_100">60m² a 100m²</option>
                    <option value="100_150">100m² a 150m²</option>
                    <option value="150_250">150m² a 250m²</option>
                    <option value="mais_250">Mais de 250m²</option>
                </select>

                {/* Bairro */}
                <select value={formData.tradeInNeighborhood || ''} onChange={(e) => updateFormData({ tradeInNeighborhood: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-[#c5a059] focus:border-[#c5a059] bg-white text-gray-900">
                    <option value="" disabled>Bairro</option>
                    <option value="Barra da Tijuca">Barra da Tijuca</option>
                    <option value="Recreio">Recreio</option>
                    <option value="Zona Sul">Zona Sul (Geral)</option>
                    <option value="Jacarepagua">Jacarepaguá</option>
                    <option value="Outro">Outro</option>
                </select>
            </div>
            
            {/* Endereço Texto */}
            <input type="text" placeholder="Endereço Completo" value={formData.tradeInAddress || ''} onChange={(e) => updateFormData({ tradeInAddress: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#c5a059] focus:border-[#c5a059] text-gray-900"/>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-transform transform hover:scale-105"
        >
          <i className="fas fa-arrow-left mr-2"></i> Voltar
        </button>
        <button
          type="submit"
          disabled={!isFormValid}
          className="px-8 py-3 bg-[#0a192f] text-white font-bold rounded-lg hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
        >
          Avançar <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </form>
  );
};

export default Step2;