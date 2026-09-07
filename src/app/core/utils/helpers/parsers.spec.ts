import {
  parseRowErrors,
  getHeadersErrors,
  parseJsonRows,
  parseFloatDistinct,
} from './parsers';

describe('Student Import Parsing Utils', () => {
  describe('parseRowErrors', () => {
    it('should parse valid row error strings and adjust 1-based index to 0-based', () => {
      const errors = [
        'Row 1: Name is required, Invalid email',
        'Row 5: Missing SISId',
      ];

      const result = parseRowErrors(errors);

      expect(result.size).toBe(2);
      expect(result.get(0)).toEqual(['Name is required', 'Invalid email']);
      expect(result.get(4)).toEqual(['Missing SISId']);
    });

    it('should ignore entries that do not match the row error pattern', () => {
      const errors = [
        'Invalid header format',
        'Row ABC: Some error',
        'Row 2: Valid error',
      ];

      const result = parseRowErrors(errors);

      expect(result.size).toBe(1);
      expect(result.get(1)).toEqual(['Valid error']);
    });

    it('should filter out empty error items caused by extra commas', () => {
      const errors = ['Row 3: Error one, , Error two, '];
      const result = parseRowErrors(errors);

      expect(result.get(2)).toEqual(['Error one', 'Error two']);
    });

    it('should return an empty map for an empty array', () => {
      const result = parseRowErrors([]);
      expect(result.size).toBe(0);
    });
  });

  describe('getHeadersErrors', () => {
    it('should filter only errors containing the word header', () => {
      const errors = [
        'Invalid header format',
        'Row 1: Email error',
        'Missing header: Email',
      ];

      const result = getHeadersErrors(errors);

      expect(result).toEqual([
        'Invalid header format',
        'Missing header: Email',
      ]);
    });

    it('should return an empty array if no error contains the word header', () => {
      const errors = ['Row 1: Invalid Name', 'Row 2: Invalid SISId'];
      const result = getHeadersErrors(errors);

      expect(result).toEqual([]);
    });

    it('should return an empty array for an empty input', () => {
      expect(getHeadersErrors([])).toEqual([]);
    });
  });

  describe('parseJsonRows', () => {
    it('should filter invalid keys and replace commas with dots in string values', () => {
      const input = [
        {
          Name: 'Student 1',
          Email: 'student1@test.com',
          AverageScore: '91,15',
          InvalidKey: 'SkipMe',
          '': 'EmptyKey',
        },
      ];

      const result = parseJsonRows(input);

      expect(result.length).toBe(1);
      expect(result[0].Name).toBe('Student 1');
      expect(result[0].Email).toBe('student1@test.com');
      expect(result[0].AverageScore).toBe('91.15');
      expect(
        (result[0] as unknown as Record<string, unknown>)['InvalidKey']
      ).toBeUndefined();
      expect(
        (result[0] as unknown as Record<string, unknown>)['']
      ).toBeUndefined();
    });

    it('should return an empty array if input rows are empty', () => {
      expect(parseJsonRows([])).toEqual([]);
    });
  });

  describe('parseFloatDistinct', () => {
    it('should return NaN for null or undefined', () => {
      expect(parseFloatDistinct(null)).toBeNaN();
      expect(parseFloatDistinct(undefined)).toBeNaN();
    });

    it('should return NaN for non-numeric strings', () => {
      expect(parseFloatDistinct('invalid')).toBeNaN();
      expect(parseFloatDistinct('')).toBeNaN();
    });

    it('should parse numbers with commas and round to 2 decimal places', () => {
      expect(parseFloatDistinct('12,345')).toBe(12.35);
      expect(parseFloatDistinct('10,5')).toBe(10.5);
    });

    it('should parse numbers with dots and round to 2 decimal places', () => {
      expect(parseFloatDistinct('12.345')).toBe(12.35);
      expect(parseFloatDistinct('86.267')).toBe(86.27);
    });

    it('should handle integer strings without altering the value', () => {
      expect(parseFloatDistinct('100')).toBe(100);
    });
  });
});
