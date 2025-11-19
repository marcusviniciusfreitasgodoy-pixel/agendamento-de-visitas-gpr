import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { CustomerData, ScoreResult } from './types';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import ScoringScreen from './components/ScoringScreen';
import ResultScreen from './components/ResultScreen';
import VoiceAssistant from './components/VoiceAssistant';

const INITIAL_FORM_DATA: CustomerData = {
  fullName: '',
  email: '',
  phone: '',
  familyMonthlyIncome: '',
  propertyIdentifier: '',
  propertyOfInterest: 'cobertura',
  paymentMethod: 'financiamento',
  hasProofOfIncome: false,
  driversLicense: null,
  financingAmount: '',
  hasPreApprovedCredit: 'nao',
  financialInstitution: '',
  tradeInPropertyValue: '',
  tradeInType: '',
  tradeInBedrooms: '',
  tradeInSize: '',
  tradeInNeighborhood: '',
  tradeInAddress: '',
  visitDate1: '',
  visitTime1: '',
  visitDate2: '',
  visitTime2: '',
  hasAcceptedTerms: false,
};

const App: React.FC = () => {
  // Initialize step from localStorage
  const [step, setStep] = useState(() => {
    try {
      const savedStep = localStorage.getItem('godoy_prime_step');
      if (savedStep) {
        const parsed = parseInt(savedStep, 10);
        // If saved on step 4 (loading), revert to step 3 to avoid stuck loading screen without active request
        return parsed === 4 ? 3 : parsed;
      }
    } catch (e) {
      console.error("Error parsing saved step:", e);
    }
    return 1;
  });

  // Initialize formData from localStorage
  const [formData, setFormData] = useState<CustomerData>(() => {
    try {
      const savedData = localStorage.getItem('godoy_prime_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Files cannot be persisted in localStorage, so we reset the file field to null
        return { ...parsedData, driversLicense: null };
      }
    } catch (e) {
      console.error("Error parsing saved data:", e);
    }
    return INITIAL_FORM_DATA;
  });

  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Save step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('godoy_prime_step', step.toString());
  }, [step]);

  // Save formData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('godoy_prime_data', JSON.stringify(formData));
  }, [formData]);

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePrevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (data: Partial<CustomerData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleVoiceUpdate = (extractedData: Partial<CustomerData>) => {
    console.log("Dados extraídos por voz:", extractedData);
    setFormData((prev) => ({ ...prev, ...extractedData }));
    
    // Show toast feedback
    const fields = Object.keys(extractedData).length;
    if (fields > 0) {
        setToast({
            show: true,
            message: `IA preencheu ${fields} campo(s) automaticamente.`
        });
        // Hide toast after 4 seconds
        setTimeout(() => setToast({ show: false, message: '' }), 4000);
    }
  };
  
  const generatePrompt = (data: CustomerData): string => {
    return `
      Você é um especialista em qualificação de clientes para o mercado imobiliário de altíssimo padrão na Barra da Tijuca, Rio de Janeiro. Sua tarefa é analisar os dados de um potencial comprador e atribuir um score de 0 a 100, junto com uma análise detalhada e recomendações, seguindo o schema JSON fornecido. O cliente está solicitando um agendamento de visita.

      **Dados do Cliente:**
      - **Nome Completo:** ${data.fullName}
      - **Email:** ${data.email}
      - **Telefone:** ${data.phone}
      - **Renda Mensal Familiar Declarada:** R$ ${data.familyMonthlyIncome}
      - **Possui Comprovação de Renda?:** ${data.hasProofOfIncome ? 'Sim' : 'Não'}
      - **Enviou documento (CNH/RG)?** ${data.driversLicense ? 'Sim' : 'Não'}

      **Interesse no Imóvel:**
      - **Imóvel Solicitado (Código/Ref):** ${data.propertyIdentifier}
      - **Tipo de Imóvel de Interesse:** ${data.propertyOfInterest}
      - **Forma de Pagamento Pretendida:** ${data.paymentMethod}
      ${data.paymentMethod === 'financiamento' ? `
      **Detalhes do Financiamento:**
      - **Valor a ser financiado:** R$ ${data.financingAmount}
      - **Possui crédito pré-aprovado?:** ${data.hasPreApprovedCredit}
      - **Instituição Financeira:** ${data.financialInstitution || 'Não informado'}
      ` : ''}
      ${data.paymentMethod === 'permuta' ? `
      **Detalhes da Permuta:**
      - **Valor estimado:** R$ ${data.tradeInPropertyValue}
      - **Tipo:** ${data.tradeInType}
      - **Quartos:** ${data.tradeInBedrooms}
      - **Tamanho:** ${data.tradeInSize}
      - **Bairro:** ${data.tradeInNeighborhood}
      - **Endereço:** ${data.tradeInAddress}
      ` : ''}

      **Preferências de Agendamento:**
      - **Opção 1:** ${data.visitDate1} às ${data.visitTime1}
      - **Opção 2:** ${data.visitDate2} às ${data.visitTime2}

      **Critérios de Avaliação:**
      1.  **Capacidade Financeira (Peso 60%):** A renda é compatível com imóveis de luxo na Barra da Tijuca (preços a partir de R$ 2 milhões)? Clientes com renda acima de R$ 50.000,00 recebem pontuação maior. Pagamento à vista tem um peso maior. A qualificação do financiamento ou da permuta também influencia aqui.
      2.  **Perfil do Cliente (Peso 30%):** O interesse no imóvel e a forma de pagamento são consistentes? A posse de comprovação de renda e documento é obrigatória e demonstra seriedade.
      3.  **Qualidade dos Dados (Peso 10%):** As informações parecem completas e consistentes?

      **Instruções para Geração:**
      - Gere uma análise concisa e profissional para o campo 'analysis'.
      - Para o campo 'recommendation', escolha um dos seguintes valores: 'Agendamento Imediato', 'Análise Adicional Necessária', 'Baixa Prioridade'.
      - Forneça 3 próximos passos acionáveis para o corretor no campo 'nextSteps', incluindo a verificação das datas de agendamento.
      - O score deve ser um número inteiro de 0 a 100.
    `;
  };

  const handleFormSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setScoreResult(null);
    setStep(4); // Scoring screen

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const prompt = generatePrompt(formData);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              analysis: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              nextSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['score', 'analysis', 'recommendation', 'nextSteps'],
          }
        }
      });

      let rawText = response.text?.trim() || '';
      if (rawText.startsWith('```json')) {
        rawText = rawText.slice(7, -3).trim();
      } else if (rawText.startsWith('```')) {
        rawText = rawText.slice(3, -3).trim();
      }
      
      const result = JSON.parse(rawText) as ScoreResult;
      setScoreResult(result);

      // Simulate sending email to the broker
      console.log("---- RESULTADO PARA IMOBILIÁRIA ----");
      console.log("Destinatário: marcus@godoyprime.com.br");
      console.log("Imóvel Solicitado:", formData.propertyIdentifier);
      console.log("Cliente:", formData.fullName);
      console.log("Análise:", JSON.stringify(result, null, 2));
      console.log("------------------------------------");

      // Simulate Auto-Response to Client
      console.log("---- AUTO-RESPOSTA (Simulada) ----");
      console.log(`Enviando email para: ${formData.email}`);
      console.log("Assunto: Recebemos sua solicitação - Godoy Prime Realty");
      console.log("Status: ENVIADO");

    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
      setStep(5); // Confirmation screen
    }
  }, [formData]);

  const restart = () => {
    // Clear localStorage to start fresh
    localStorage.removeItem('godoy_prime_step');
    localStorage.removeItem('godoy_prime_data');

    setStep(1);
    setFormData(INITIAL_FORM_DATA);
    setScoreResult(null);
    setIsLoading(false);
    setError(null);
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 formData={formData} updateFormData={updateFormData} onNext={handleNextStep} />;
      case 2:
        return <Step2 formData={formData} updateFormData={updateFormData} onNext={handleNextStep} onBack={handlePrevStep} />;
      case 3:
        return <Step3 formData={formData} updateFormData={updateFormData} onSubmit={handleFormSubmit} onBack={handlePrevStep} />;
      case 4:
        return <ScoringScreen />;
      case 5:
        return <ResultScreen error={error} onRestart={restart} customerName={formData.fullName} customerEmail={formData.email} />;
      default:
        return <Step1 formData={formData} updateFormData={updateFormData} onNext={handleNextStep} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans relative">
        {/* Toast Notification */}
        {toast.show && (
            <div className="fixed top-5 right-5 z-[100] bg-[#0a192f] border-l-4 border-[#c5a059] text-white px-6 py-4 rounded shadow-2xl flex items-center animate-fade-in">
                <i className="fas fa-magic text-[#c5a059] mr-3 text-xl"></i>
                <div>
                    <h4 className="font-bold text-sm text-[#c5a059] uppercase">Voice Assistant</h4>
                    <p className="text-sm">{toast.message}</p>
                </div>
            </div>
        )}

      <div className="w-full max-w-2xl mx-auto">
        {/* Brand Header with Navy Blue (#0a192f) and Gold (#c5a059) */}
        <header className="text-center mb-8 bg-[#0a192f] pt-8 pb-6 px-6 rounded-xl shadow-lg border-b-4 border-[#c5a059] flex flex-col justify-center items-center">
          <p className="text-sm text-white/80 uppercase tracking-widest mb-1" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>Agendamento de Visitas</p>
          <h1 className="text-3xl font-bold text-[#c5a059] tracking-widest uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Godoy Prime Realty</h1>
        </header>
        
        <main className="bg-white rounded-2xl shadow-2xl p-8 transition-all duration-500">
          {renderStep()}
        </main>
         <footer className="text-center mt-8 text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Godoy Prime Realty. Todos os direitos reservados.</p>
        </footer>
      </div>
      <VoiceAssistant onDataExtracted={handleVoiceUpdate} />
    </div>
  );
};

export default App;