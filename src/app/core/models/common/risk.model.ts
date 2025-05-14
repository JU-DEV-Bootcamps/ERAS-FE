export interface AnswersRisks {
  risks: number[];
  averageRisk: number;
}

export type RiskLevel =
  | 'No Answer'
  | 'Low Risk'
  | 'Low-Medium Risk'
  | 'Medium Risk'
  | 'Medium-High Risk'
  | 'High Risk';
