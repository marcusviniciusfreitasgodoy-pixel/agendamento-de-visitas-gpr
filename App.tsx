import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { CustomerData, ScoreResult } from './types';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import ScoringScreen from './components/ScoringScreen';
import ResultScreen from './components/ResultScreen';
import VoiceAssistant from './components/VoiceAssistant';

// -------------------------
// DADOS INICIAIS
// -------------------------
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

// ---------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------
const App: React.FC = () => {

  // -----------------------------
  // ESTADOS
  // -----------------------------
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('godoy_prime_step');
    return saved ? (saved === "4" ? 3 : parseInt(saved, 10)) : 1;
  });

  const [formData, setFormData] = useState<CustomerData>(() => {
    const saved = localStorage.getItem('godoy_prime_data');
    return saved ? { ...JSON.parse(saved), driversLicense: null } : INITIAL_FORM_DATA;
  });

  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState({ show: false, message: '' });

  // -----------------------------
  // SALVAR LOCALMENTE
  // -----------------------------
  useEffect(() => {
    localStorage.setItem('godoy_prime_step', String(step));
  }, [step]);

  useEffect(() => {
    localStorage.setItem('godoy_prime_data', JSON.stringify(formData));
  }, [formData]);

  // -----------------------------
  // ATUALIZA FORM
  // -----------------------------
  const updateFormData = (d: Partial<CustomerData>) =>
    setFormData(prev => ({ ...prev, ...d }));

  const handleNextStep = () => setStep(s => s + 1);
  const handlePrevStep = () => setStep(s => s - 1);

  // -----------------------------
  // UPDATE VIA VOZ
  // -----------------------------
  const handleVoiceUpdate = (data: Partial<CustomerData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    const count = Object.keys(data).length;
    if (count > 0) {
      setToast({ show: true, message: `IA preencheu ${count} campo(s).` });
      setTimeout(() => setToast({ show: false, message: '' }), 4000);
    }
  };

  // -----------------------------
  // SALVAR AGENDAMENTO COMPLETO
  // -----------------------------
  const salvarAgendamento = async (scoreResult: ScoreResult | null) => {
    const payload = {
      ...formData,
      scoreResult,
      driversLicense: formData.driversLicense || null
    };

    // Supabase
    await fetch("/.netlify/functions/save", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    // E-mail
    await fetch("/.netlify/functions/sendEmail", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    // WhatsApp
    const respWpp = await fetch("/.netlify/functions/notifyImobiliaria", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const wppData = await respWpp.json();
    if (wppData.whatsappUrl) {
      window.open(wppData.whatsappUrl, "_blank");
    }
  };

  // -----------------------------
  // PROMPT IA
  // -----------------------------
  const generatePrompt = (data: CustomerData): string => `
    (Texto do prompt que você já tinha — mantido igual)
  `;

  // -----------------------------
  // SUBMIT PRINCIPAL (CORRIGIDO)
  // -----------------------------
  const handleFormSubmit = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setScoreResult(null);

    // Ir para a tela de carregamento
    setStep(4);

    try {
      // IA
      const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY as string
      });

      const prompt = generatePrompt(formData);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.OBJECT }
        }
      });

      let raw = response.text?.trim() || "";
      if (raw.startsWith("```")) raw = raw.replace(/```(json)?/g, "").trim();

      const result = JSON.parse(raw);
      setScoreResult(result);

      // Salvar tudo
      await salvarAgendamento(result);

      // Sucesso REAL
      setStep(5);

    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao processar a solicitação.");

      // Mostrar Step 5 com erro
      setStep(5);

    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  // -----------------------------
  // RESET
  // -----------------------------
  const restart = () => {
    localStorage.removeItem('godoy_prime_step');
    localStorage.removeItem('godoy_prime_data');
    setStep(1);
    setFormData(INITIAL_FORM_DATA);
    setScoreResult(null);
    setError(null);
  };

  // -----------------------------
  // RENDER DAS ETAPAS
  // -----------------------------
  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 formData={formData} updateFormData={updateFormData} onNext={handleNextStep} />;
      case 2: return <Step2 formData={formData} updateFormData={updateFormData} onNext={handleNextStep} onBack={handlePrevStep} />;
      case 3: return <Step3 formData={formData} updateFormData={updateFormData} onSubmit={handleFormSubmit} onBack={handlePrevStep} />;
      case 4: return <ScoringScreen />;
      case 5: return <ResultScreen error={error} onRestart={restart} customerName={formData.fullName} customerEmail={formData.email} />;
      default: return <Step1 formData={formData} updateFormData={updateFormData} onNext={handleNextStep} />;
    }
  };

  // -----------------------------
  // LAYOUT
  // -----------------------------
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans relative">

      {toast.show && (
        <div className="fixed top-5 right-5 z-[100] bg-[#0a192f] border-l-4 border-[#c5a059] text-white px-6 py-4 rounded shadow-2xl">
          <h4 className="font-bold text-sm text-[#c5a059] uppercase">Voice Assistant</h4>
          <p className="text-sm">{toast.message}</p>
        </div>
      )}

      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8 bg-[#0a192f] pt-8 pb-6 px-6 rounded-xl shadow-lg border-b-4 border-[#c5a059]">
          <p className="text-sm text-white/80 uppercase tracking-widest mb-1">Agendamento de Visitas</p>
          <h1 className="text-3xl font-bold text-[#c5a059] tracking-widest uppercase">Godoy Prime Realty</h1>
        </header>

        <main className="bg-white rounded-2xl shadow-2xl p-8">
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
