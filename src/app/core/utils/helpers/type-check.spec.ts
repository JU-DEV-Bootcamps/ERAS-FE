import { PollAvgQuestion, PollCountQuestion } from '@core/models/summary.model';
import {
  isCSVParserError,
  isPollAvgQuestion,
  isPollCountQuestion,
} from './type-check';

describe('Poll and Parser Type Guards', () => {
  describe('isPollCountQuestion', () => {
    it('should return true if question contains answers property', () => {
      const countQuestion = { answers: [] } as unknown as PollCountQuestion;
      expect(isPollCountQuestion(countQuestion)).toBeTrue();
    });

    it('should return false if question does not contain answers property', () => {
      const avgQuestion = { answersDetails: [] } as unknown as PollAvgQuestion;
      expect(isPollCountQuestion(avgQuestion)).toBeFalse();
    });
  });

  describe('isPollAvgQuestion', () => {
    it('should return true if question contains answersDetails property', () => {
      const avgQuestion = { answersDetails: [] } as unknown as PollAvgQuestion;
      expect(isPollAvgQuestion(avgQuestion)).toBeTrue();
    });

    it('should return false if question does not contain answersDetails property', () => {
      const countQuestion = { answers: [] } as unknown as PollCountQuestion;
      expect(isPollAvgQuestion(countQuestion)).toBeFalse();
    });
  });

  describe('isCSVParserError', () => {
    it('should return true if all objects have the parserError property', () => {
      const errors = [
        {
          parserError: true,
          code: 'E01',
          message: 'Error 1',
          row: 1,
          type: 'Field',
        },
        {
          parserError: false,
          code: 'E02',
          message: 'Error 2',
          row: 2,
          type: 'Format',
        },
      ];

      expect(isCSVParserError(errors)).toBeTrue();
    });

    it('should return false if at least one object lacks the parserError property', () => {
      const errors = [
        { parserError: true, code: 'E01', message: 'Error 1' },
        { code: 'E02', message: 'Missing property' },
      ];

      expect(isCSVParserError(errors)).toBeFalse();
    });

    it('should return true for an empty array', () => {
      expect(isCSVParserError([])).toBeTrue();
    });
  });
});
