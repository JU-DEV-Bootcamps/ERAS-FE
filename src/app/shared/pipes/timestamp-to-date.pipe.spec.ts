import { TimestampToDatePipe } from './timestamp-to-date.pipe';

describe('TimestampToDatePipe', () => {
  let pipe: TimestampToDatePipe;

  beforeEach(() => {
    pipe = new TimestampToDatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty string when value is null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should format a valid Date object', () => {
    const date = new Date('2026-03-15T12:00:00Z');

    const result = pipe.transform(date);

    expect(result).toBe('March 15, 2026');
  });

  it('should format a valid date string coercible to a Date', () => {
    const dateLike = '2026-07-04T12:00:00Z' as unknown as Date;

    const result = pipe.transform(dateLike);

    expect(result).toBe('July 04, 2026');
  });

  it('should return "Invalid date" for an unparsable value', () => {
    const invalid = 'not-a-real-date' as unknown as Date;

    const result = pipe.transform(invalid);

    expect(result).toBe('Invalid date');
  });
});
