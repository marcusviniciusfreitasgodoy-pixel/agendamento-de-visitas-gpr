import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Props {
  propertyIdentifier: string;
}

const LocationAgent: React.FC<Props> = ({ propertyIdentifier }) => {
  const [info, setInfo] = useState<string | null>(null);
  const [mapUri, setMapUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocationInfo = async () => {
    if (!propertyIdentifier) return;
    setIsLoading(true);
    setInfo(null);
    setMapUri(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Localize o imóvel ou condomínio identificado por "${propertyIdentifier}" na Barra da Tijuca, Rio de Janeiro.
                   1. Forneça um resumo curto (máx 3 linhas) sobre o condomínio ou a microlocalização (segurança, proximidade da praia, comércio).
                   2. Use a tool do Google Maps para obter a localização exata.`,
        config: {
          tools: [{ googleMaps: {} }, { googleSearch: {} }],
        }
      });

      const text = response.text;
      setInfo(text || "Informações detalhadas não encontradas.");

      // Extract Maps URI from grounding metadata
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      let foundUri: string | null = null;

      if (groundingChunks) {
        for (const chunk of groundingChunks) {
           if (chunk.web?.uri && chunk.web.uri.includes('google.com/maps')) {
             foundUri = chunk.web.uri;
             break;
           }
           // Check for maps property (accessing loosely to handle SDK type variations)
           const c = chunk as any;
           if (c.maps?.uri) {
             foundUri = c.maps.uri;
             break;
           }
        }
        // Fallback: look for any URI in chunks if specific map check fails but tool was used
        if (!foundUri) {
             const mapChunk = groundingChunks.find(c => c.web?.uri?.includes('maps'));
             if (mapChunk?.web?.uri) foundUri = mapChunk.web.uri;
        }
      }
      
      if (foundUri) {
        setMapUri(foundUri);
      }

    } catch (e) {
      console.error("Error fetching location info", e);
      setInfo("Não foi possível carregar as informações de localização no momento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 mb-6">
      {!info && !isLoading && (
        <button
          type="button"
          onClick={fetchLocationInfo}
          disabled={!propertyIdentifier}
          className="text-sm text-[#0a192f] underline font-medium hover:text-[#c5a059] disabled:text-gray-400 disabled:no-underline flex items-center gap-2"
        >
          <i className="fas fa-map-marker-alt"></i>
          Ver informações de localização e mapa
        </button>
      )}

      {isLoading && (
        <div className="text-sm text-gray-500 flex items-center gap-2 animate-pulse">
          <i className="fas fa-circle-notch animate-spin"></i> Buscando informações do local...
        </div>
      )}

      {info && (
        <div className="bg-white border-l-4 border-[#c5a059] p-4 rounded shadow-sm animate-fade-in mt-2">
          <h4 className="text-sm font-bold text-[#0a192f] mb-2 uppercase tracking-wide">Inteligência de Localização</h4>
          <div className="text-sm text-gray-700 mb-3 leading-relaxed">
            {info}
          </div>
          
          {mapUri ? (
            <a 
              href={mapUri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm font-semibold transition-colors"
            >
              <i className="fas fa-directions mr-2"></i> Ver Rota no Google Maps
            </a>
          ) : (
             <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propertyIdentifier + " Barra da Tijuca")}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-semibold transition-colors"
            >
              <i className="fas fa-search-location mr-2"></i> Buscar no Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAgent;