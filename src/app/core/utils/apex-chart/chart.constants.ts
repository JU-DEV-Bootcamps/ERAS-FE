import {
  RISK_COLORS,
  RISK_LABELS,
  RISK_TEXT_COLORS,
} from '@core/constants/riskLevel';

export const fixedColorRange = [
  {
    from: -1,
    to: 0.49,
    color: RISK_COLORS[0],
    foreColor: RISK_TEXT_COLORS[0],
    name: RISK_LABELS[0], //No Answer
  },
  {
    from: 0.5,
    to: 1.49,
    color: RISK_COLORS[1],
    foreColor: RISK_TEXT_COLORS[1],
    name: RISK_LABELS[1], //'Low Risk',
  },
  {
    from: 1.5,
    to: 2.49,
    color: RISK_COLORS[2],
    foreColor: RISK_TEXT_COLORS[2],
    name: RISK_LABELS[2], //'Low-Medium Risk',
  },
  {
    from: 2.5,
    to: 3.49,
    color: RISK_COLORS[3],
    foreColor: RISK_TEXT_COLORS[3],
    name: RISK_LABELS[3], //'Medium Risk',
  },
  {
    from: 3.5,
    to: 4.49,
    color: RISK_COLORS[4],
    foreColor: RISK_TEXT_COLORS[4],
    name: RISK_LABELS[4], //'Medium-High Risk',
  },
  {
    from: 4.5,
    to: 14,
    color: RISK_COLORS[5],
    foreColor: RISK_TEXT_COLORS[5],
    name: RISK_LABELS[5], //'High Risk',
  },
];

export const CHART_LAYOUT = {
  expanded: {
    columnDivisor: 12.5,
    cellHeight: 56,
    labelPercent: 0.5,
  },
  compact: {
    columnDivisor: 9.5,
    cellHeight: 32,
    labelPercent: 0.3,
  },
};
