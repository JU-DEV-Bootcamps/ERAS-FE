import {
  getRiskColor,
  getRiskGroup,
  getRiskLabel,
  getRiskTextColor,
  RISK_COLORS,
  RISK_LABELS,
  RISK_LEVEL,
  RISK_TEXT_COLORS,
} from './riskLevel';

describe('Risk Constants and Utils', () => {
  describe('Constants definition', () => {
    it('should have all risk constants properly defined', () => {
      expect(RISK_COLORS[0]).toBe('#BDBDBD');
      expect(RISK_COLORS.default).toBe('#EF5350');

      expect(RISK_TEXT_COLORS[0]).toBe('#003735');
      expect(RISK_TEXT_COLORS.default).toBe('#FFFFFF');

      expect(RISK_LABELS[0]).toBe('No Answer');
      expect(RISK_LABELS.default).toBe('High');

      expect(RISK_LEVEL[0]).toBe('No Answer');
      expect(RISK_LEVEL.default).toBe('High');
    });
  });

  describe('getRiskGroup', () => {
    it('should return 0 when risk is less than 1', () => {
      expect(getRiskGroup(0)).toBe(0);
      expect(getRiskGroup(0.9)).toBe(0);
    });

    it('should return 1 when risk is between 1 and less than 1.5', () => {
      expect(getRiskGroup(1)).toBe(1);
      expect(getRiskGroup(1.4)).toBe(1);
    });

    it('should return 2 when risk is between 1.5 and less than 2.5', () => {
      expect(getRiskGroup(1.5)).toBe(2);
      expect(getRiskGroup(2.4)).toBe(2);
    });

    it('should return 3 when risk is between 2.5 and less than 3.5', () => {
      expect(getRiskGroup(2.5)).toBe(3);
      expect(getRiskGroup(3.4)).toBe(3);
    });

    it('should return 4 when risk is between 3.5 and less than 4.5', () => {
      expect(getRiskGroup(3.5)).toBe(4);
      expect(getRiskGroup(4.4)).toBe(4);
    });

    it('should return 5 when risk is 4.5 or greater', () => {
      expect(getRiskGroup(4.5)).toBe(5);
      expect(getRiskGroup(5.0)).toBe(5);
      expect(getRiskGroup(10)).toBe(5);
    });
  });

  describe('getRiskColor', () => {
    it('should return rounded risk color when level is <= 5', () => {
      expect(getRiskColor(1)).toBe(RISK_COLORS[1]);
      expect(getRiskColor(2.4)).toBe(RISK_COLORS[2]);
      expect(getRiskColor(2.6)).toBe(RISK_COLORS[3]);
    });

    it('should clamp to 5 when level is greater than 5 (roundRiskLevel branch true)', () => {
      expect(getRiskColor(6)).toBe(RISK_COLORS[5]);
      expect(getRiskColor(10)).toBe(RISK_COLORS[5]);
    });
  });

  describe('getRiskLabel', () => {
    it('should return corresponding label for valid risk levels', () => {
      expect(getRiskLabel(1)).toBe(RISK_LABELS[1]);
      expect(getRiskLabel(5)).toBe(RISK_LABELS[5]);
    });

    it('should clamp to 5 when risk level is greater than 5', () => {
      expect(getRiskLabel(8)).toBe(RISK_LABELS[5]);
    });

    it('should fallback to RISK_LABELS[0] when key does not exist (branch fallback)', () => {
      expect(getRiskLabel(-1)).toBe(RISK_LABELS[0]);
    });
  });

  describe('getRiskTextColor', () => {
    it('should return corresponding text color for valid risk levels', () => {
      expect(getRiskTextColor(0)).toBe(RISK_TEXT_COLORS[0]);
      expect(getRiskTextColor(3)).toBe(RISK_TEXT_COLORS[3]);
    });

    it('should clamp to 5 when risk level is greater than 5', () => {
      expect(getRiskTextColor(9)).toBe(RISK_TEXT_COLORS[5]);
    });

    it('should fallback to RISK_TEXT_COLORS.default when key does not exist (branch fallback)', () => {
      expect(getRiskTextColor(-1)).toBe(RISK_TEXT_COLORS.default);
    });
  });
});
