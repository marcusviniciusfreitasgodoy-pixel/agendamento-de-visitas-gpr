import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { CustomerData } from '../types';

interface Props {
  onDataExtracted: (data: Partial<CustomerData>) => void;
}

const VoiceAssistant: React.FC<Props> = ({ onDataExtracted }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(blob);
        setIsProcessing(false);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the "data:audio/webm;base64," prefix
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
    });
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const base64Audio = await blobToBase64(audioBlob);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      // Define schema to map extracted data to CustomerData type
      const schema = {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          familyMonthlyIncome: { type: Type.STRING },
          propertyIdentifier: { type: Type.STRING },
          propertyOfInterest: { type: Type.STRING, enum: ['cobertura', 'casa', 'apartamento_tipo', 'terreno'] },
          paymentMethod: { type: Type.STRING, enum: ['financiamento', 'a_vista', 'permuta'] },
          financingAmount: { type: Type.STRING },
          tradeInPropertyValue: { type: Type.STRING },
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: base64Audio
            }
          },
          {
            text: `Extraia as informações do áudio para preencher um formulário de imobiliária. 
                   Identifique dados como nome, email, telefone, renda (formato texto), código do imóvel, tipo de interesse, forma de pagamento.
                   Se o usuário mencionar "cobertura", "casa", "apartamento", mapeie para o enum correto.
                   Retorne APENAS o JSON.`
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        onDataExtracted(data);
      }

    } catch (error) {
      console.error("Error processing audio with AI:", error);
      alert("Erro ao processar o áudio. Tente novamente.");
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
        {isProcessing && (
            <div className="absolute -top-12 right-0 bg-white px-3 py-1 rounded-lg shadow-md text-sm text-[#0a192f] whitespace-nowrap font-medium animate-pulse">
                Processando...
            </div>
        )}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isRecording 
            ? 'bg-red-600 scale-110 animate-pulse' 
            : 'bg-[#0a192f] hover:bg-[#c5a059] hover:scale-105'
        }`}
        title="Falar para preencher"
      >
        <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'} text-white text-2xl`}></i>
      </button>
    </div>
  );
};

export default VoiceAssistant;