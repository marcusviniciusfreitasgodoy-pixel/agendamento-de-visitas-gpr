
export interface CustomerData {
  fullName: string;
  email: string;
  phone: string;
  familyMonthlyIncome: string;
  
  // Property to Visit
  propertyIdentifier: string; // Code, Link or Description
  
  propertyOfInterest: 'cobertura' | 'casa' | 'apartamento_tipo' | 'terreno';
  paymentMethod: 'financiamento' | 'a_vista' | 'permuta';
  hasProofOfIncome: boolean;
  driversLicense: File | null;
  financingAmount?: string;
  hasPreApprovedCredit?: 'sim' | 'nao';
  financialInstitution?: string;
  
  // Trade-in specific fields
  tradeInPropertyValue?: string;
  tradeInType?: string;
  tradeInBedrooms?: string;
  tradeInSize?: string;
  tradeInNeighborhood?: string;
  tradeInAddress?: string;

  visitDate1: string;
  visitTime1: string;
  visitDate2: string;
  visitTime2: string;

  // LGPD
  hasAcceptedTerms: boolean;
}

export interface ScoreResult {
  score: number;
  analysis: string;
  recommendation: 'Agendamento Imediato' | 'Análise Adicional Necessária' | 'Baixa Prioridade';
  nextSteps: string[];
}
