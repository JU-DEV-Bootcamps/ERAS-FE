import { FileNameUtils } from './file-name';

describe('FileNameUtils', () => {
  beforeEach(() => {
    spyOn(Date.prototype, 'toISOString').and.returnValue(
      '2026-09-07T12:49:30.000Z'
    );
    spyOn(Date.prototype, 'toTimeString').and.returnValue('12:49:30 GMT-0400');
  });

  it('should generate a file name with the default prefix "file"', () => {
    const result = FileNameUtils.generateFileName();
    expect(result).toBe('file_20260907_124930');
  });

  it('should generate a file name with a custom prefix', () => {
    const result = FileNameUtils.generateFileName('report');
    expect(result).toBe('report_20260907_124930');
  });

  it('should generate a file name when passing an empty string as prefix', () => {
    const result = FileNameUtils.generateFileName('');
    expect(result).toBe('_20260907_124930');
  });
});
