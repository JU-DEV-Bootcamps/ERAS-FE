import { customTooltip, addCountPercentages } from './customTooltip-v2';
import { RISK_COLORS } from '@core/constants/riskLevel';
import { PollCountAnswer } from '@core/models/summary.model';

describe('Chart Utilities', () => {
  describe('addCountPercentages', () => {
    it('should calculate percentages correctly for a list of answers', () => {
      const mockAnswers = [
        { count: 50 },
        { count: 25 },
        { count: 25 },
      ] as unknown as PollCountAnswer[];

      const result = addCountPercentages(mockAnswers);

      expect(result.length).toBe(3);
      expect(result[0].countPercentage).toBe(50);
      expect(result[1].countPercentage).toBe(25);
      expect(result[2].countPercentage).toBe(25);
    });

    it('should return 0 percentage if total count is 0 to avoid division by zero', () => {
      const mockAnswers = [
        { count: 0 },
        { count: 0 },
      ] as unknown as PollCountAnswer[];

      const result = addCountPercentages(mockAnswers);

      expect(result[0].countPercentage).toBe(0);
      expect(result[1].countPercentage).toBe(0);
    });

    it('should return an empty array if input is empty', () => {
      const result = addCountPercentages([]);
      expect(result).toEqual([]);
    });
  });

  describe('customTooltip', () => {
    it('should render tooltip HTML with basic xValue, yValue, and color', () => {
      const riskKeys = Object.keys(RISK_COLORS);
      const mockRiskKey = riskKeys.length > 0 ? riskKeys[0] : 'undefined';
      const mockRiskColor =
        riskKeys.length > 0
          ? (RISK_COLORS as Record<string, string>)[mockRiskKey]
          : '#FF0000';

      const result = customTooltip('Math Course', '15', '', mockRiskColor);

      expect(result).toContain('Math Course');
      expect(result).toContain('15 Students');

      expect(result).toContain(`point-tooltip-color-${mockRiskKey}`);
    });

    it('should render class "point-tooltip-color-undefined" if color is not in RISK_COLORS', () => {
      const result = customTooltip('History', '5', '', '#000000_fake');

      expect(result).toContain('point-tooltip-color-undefined');
    });

    it('should correctly format and render emails in a list (<ul><li>)', () => {
      const zValueEmails = 'student1@test.com; student2@test.com';
      const result = customTooltip('Science', '2', zValueEmails, '#00FF00');

      expect(result).toContain('<ul class="mail-list">');
      expect(result).toContain('<li>student1@test.com</li>');
      expect(result).toContain('<li>student2@test.com</li>');
      expect(result).toContain('</ul>');
    });

    it('should remove semicolons before HTML tags like <br/> or <span>', () => {
      const zValueHTML = 'juan@test.com; <br/>maria@test.com; <span>';
      const result = customTooltip('Art', '2', zValueHTML, '#FF0000');

      expect(result).not.toContain(';<br/>');
      expect(result).not.toContain('; <span>');

      expect(result).toContain('<li>juan@test.com</li>');
      expect(result).toContain('<li>maria@test.com</li>');
    });

    it('should handle empty formattedZValue returning empty email list space', () => {
      const result = customTooltip(
        'Physics',
        '10',
        undefined as unknown as string,
        '#FF0000'
      );

      expect(result).not.toContain('<ul class="mail-list">');
      expect(result).toContain('<div class="apexcharts-tooltip-z">');
    });
  });
});
