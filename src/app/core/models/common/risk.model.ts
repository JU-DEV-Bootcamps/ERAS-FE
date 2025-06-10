export interface RiskCountReport {
  risks: RiskCount[];
  averageRisk: number;
  answerCount: number;
}

export interface RiskCount {
  label: string;
  startRange: number;
  endRange: number;
  count: number;
}
