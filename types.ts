export interface CustomerData {
  fullName: string;
  email: string;
  phone: string;

  familyMonthlyIncome: string;

  // Identificador do imóvel (ID, URL, código etc.)
  propertyIdentifier: string;

  // Interesses
  propertyOfInterest: 'cobertura' | 'casa' | 'apartamento_tipo' | 'terreno';
  paymentMethod: 'financiamento' | 'a_vista' | 'permuta';

  hasProofOfIncome: boolean;
  driversLicense: File | null;
  financingAmount?: string;
  hasPreApprovedCredit?: 'sim' | 'nao';
  financialInstitution?: string;

  // Trade-in (imóvel para vender)
  tradeInPropertyValue?: string;
  tradeInType?: string;
  tradeInBedrooms?: string;
  tradeInSize?: string;
  tradeInNeighborhood?: string;
  tradeInAddress?: string;

  // Agendamento
  visitDate1: string;
  visitTime1: string;
  visitDate2: string;
  visitTime2: string;

  // Campos adicionais opcionais
  budgetMin?: string;
  budgetMax?: string;
  visitDetail?: string;

  // LGPD
  hasAcceptedTerms: boolean;
}

export interface ScoreResult {
  score: number;
  analysis: string;
  recommendation: 'Agendamento Imediato' | 'Análise Adicional Necessária' | 'Baixa Prioridade';
  nextSteps: string[];
}
