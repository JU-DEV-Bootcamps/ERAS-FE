import { RangeTimestampPipe } from './range-timestamp.pipe';

describe('RangeTimestampPipe', () => {
  let pipe: RangeTimestampPipe;

  beforeEach(() => {
    pipe = new RangeTimestampPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty string when value is null', () => {
    expect(
      pipe.transform(null as unknown as { startDate: string; endDate: string })
    ).toBe('');
  });

  it('should return an empty string when value is undefined', () => {
    expect(
      pipe.transform(
        undefined as unknown as { startDate: string; endDate: string }
      )
    ).toBe('');
  });

  it('should format a valid start and end date range', () => {
    const result = pipe.transform({
      startDate: '2026-01-15T12:00:00Z',
      endDate: '2026-02-20T12:00:00Z',
    });

    expect(result).toBe('January 15, 2026 to February 20, 2026');
  });

  it('should format a range where start and end are the same day', () => {
    const result = pipe.transform({
      startDate: '2026-06-01T12:00:00Z',
      endDate: '2026-06-01T12:00:00Z',
    });

    expect(result).toBe('June 01, 2026 to June 01, 2026');
  });
});
