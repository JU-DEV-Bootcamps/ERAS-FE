import { LastAccessPipe } from './last-access.pipe';

describe('LastAccessPipe', () => {
  let pipe: LastAccessPipe;

  beforeEach(() => {
    pipe = new LastAccessPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform a positive number into a "days ago" string', () => {
    expect(pipe.transform(5)).toBe('5 days ago');
  });

  it('should transform zero into a "days ago" string', () => {
    expect(pipe.transform(0)).toBe('0 days ago');
  });

  it('should transform a negative number into a "days ago" string', () => {
    expect(pipe.transform(-3)).toBe('-3 days ago');
  });

  it('should return an empty string when value is NaN', () => {
    expect(pipe.transform(NaN)).toBe('');
  });
});
