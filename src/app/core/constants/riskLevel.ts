export const RISK_COLORS: Record<number | 'default', string> = {
  0: '#939090',
  1: '#008000',
  2: '#3CB371',
  3: '#F0D722',
  4: '#FFA500',
  5: '#FF0000',
  default: '#FF0000',
};

export const RISK_TEXT_COLORS: Record<number | 'default', string> = {
  0: '#003735', // Black text for gray background
  1: '#003735', // Black text for dark green
  2: '#003735', // Black text for medium sea green
  3: '#003735', // Black text for yellow
  4: '#003735', // Black text for orange
  5: '#003735', // Black text for red
  default: '#FFFFFF',
};

export type RiskLevel =
  | 'No Answer'
  | 'Low Risk'
  | 'Low-Medium Risk'
  | 'Medium Risk'
  | 'Medium-High Risk'
  | 'High Risk';

export const RISK_LABELS: Record<number | 'default', RiskLevel> = {
  0: 'No Answer',
  1: 'Low Risk',
  2: 'Low-Medium Risk',
  3: 'Medium Risk',
  4: 'Medium-High Risk',
  5: 'High Risk',
  default: 'High Risk',
};

export const RISK_LEVEL: Record<number | 'default', string> = {
  0: 'No Answer',
  1: 'Low',
  2: 'Low-Medium',
  3: 'Medium',
  4: 'Medium-High',
  5: 'High',
  default: 'High',
};

export type RiskColorType = keyof typeof RISK_COLORS;

const roundRiskLevel = (riskLevel: number) =>
  riskLevel > 5 ? 5 : Math.round(riskLevel);

export const getRiskColor = (riskLevel: number) =>
  RISK_COLORS[roundRiskLevel(riskLevel)];

export const getRiskLabel = (riskLevel: number) =>
  RISK_LABELS[roundRiskLevel(riskLevel)] || RISK_LABELS[0];

export const getRiskTextColor = (riskLevel: number) =>
  RISK_TEXT_COLORS[roundRiskLevel(riskLevel)] || RISK_TEXT_COLORS.default;
