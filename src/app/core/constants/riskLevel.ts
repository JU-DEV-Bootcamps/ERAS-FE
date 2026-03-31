export const RISK_COLORS: Record<number | 'default', string> = {
  0: '#BDBDBD',
  1: '#43A047',
  2: '#66BB6A',
  3: '#FDD835',
  4: '#FFB74D',
  5: '#EF5350',
  default: '#EF5350',
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
  | 'Low'
  | 'Low-Medium'
  | 'Medium'
  | 'Medium-High'
  | 'High';

export const RISK_LABELS: Record<number | 'default', RiskLevel> = {
  0: 'No Answer',
  1: 'Low',
  2: 'Low-Medium',
  3: 'Medium',
  4: 'Medium-High',
  5: 'High',
  default: 'High',
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

export const getRiskGroup = (risk: number): number => {
  if (risk < 1) return 0;
  if (risk < 1.5) return 1;
  if (risk < 2.5) return 2;
  if (risk < 3.5) return 3;
  if (risk < 4.5) return 4;
  return 5;
};

export const getRiskColor = (riskLevel: number) =>
  RISK_COLORS[roundRiskLevel(riskLevel)];

export const getRiskLabel = (riskLevel: number) =>
  RISK_LABELS[roundRiskLevel(riskLevel)] || RISK_LABELS[0];

export const getRiskTextColor = (riskLevel: number) =>
  RISK_TEXT_COLORS[roundRiskLevel(riskLevel)] || RISK_TEXT_COLORS.default;
