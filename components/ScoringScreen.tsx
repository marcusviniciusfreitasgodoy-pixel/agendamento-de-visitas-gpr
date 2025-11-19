
import React from 'react';

const ScoringScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[400px] text-center">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
        <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-gem text-blue-600 text-3xl animate-pulse"></i>
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-gray-700 mt-8">Analisando Perfil...</h2>
      <p className="text-gray-500 mt-2">
        Nossa inteligência artificial está processando as informações para gerar uma análise detalhada.
      </p>
      <p className="text-gray-500">Isso pode levar alguns segundos.</p>
    </div>
  );
};

export default ScoringScreen;
