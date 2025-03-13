export const RISK_COLORS = {
  0: '#939090',
  1: '#008000',
  2: '#3CB371',
  3: '#F0D722',
  4: '#FFA500',
  default: '#FF0000',
};

export const RISK_LABELS = {
  0: 'No Answer',
  1: 'Low Risk',
  2: 'Low-Medium Risk',
  3: 'Medium Risk',
  4: 'Medium-High Risk',
  5: 'High Risk',
};

export type RiskColorType = keyof typeof RISK_COLORS;
