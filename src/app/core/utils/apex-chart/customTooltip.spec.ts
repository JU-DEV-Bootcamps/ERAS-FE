import { PollCountAnswer } from '@core/models/summary.model';
import { addCountPercentages, customTooltip } from './customTooltip';

describe('Chart Utilities (Variant 2)', () => {
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
    it('should render tooltip HTML with basic xValue (Question) and yValue (Answer)', () => {
      const result = customTooltip('What is your favorite color?', 'Blue', '');

      expect(result).toContain('<b>Q: What is your favorite color?</b>');
      expect(result).toContain('<b>Answer: </b>Blue');
    });

    it('should correctly format and render emails in a list (<ul><li>) with specific inline styles', () => {
      const zValueEmails = 'student1@test.com; student2@test.com';
      const result = customTooltip('Question 1', 'Answer 1', zValueEmails);

      expect(result).toContain(
        '<ul style="padding: 0 0 0 15px; color: #797676;">'
      );
      expect(result).toContain('<li>student1@test.com</li>');
      expect(result).toContain('<li>student2@test.com</li>');
      expect(result).toContain('</ul>');
    });

    it('should remove semicolons before HTML tags like <br/> or <span>', () => {
      const zValueHTML = 'juan@test.com; <br/>maria@test.com; <span>';
      const result = customTooltip('Q2', 'A2', zValueHTML);

      expect(result).not.toContain(';<br/>');
      expect(result).not.toContain('; <span>');

      expect(result).toContain('<li>juan@test.com</li>');
      expect(result).toContain('<li>maria@test.com</li>');
    });

    it('should handle empty formattedZValue returning empty space in the z section', () => {
      const result = customTooltip('Q3', 'A3', undefined as unknown as string);

      expect(result).not.toContain('<ul');
      expect(result).toContain('<div class="apexcharts-tooltip-z"');
    });
  });
});
