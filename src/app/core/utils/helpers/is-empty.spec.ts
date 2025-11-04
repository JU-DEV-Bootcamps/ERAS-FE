import { isEmpty } from './is-empty';

describe('isEmpty', () => {
  it('should return true, whether the value is null', () => {
    const isNullEmpty = isEmpty(null);
    expect(isNullEmpty).toBeTrue();
  });

  it('should return true, whether the value is undefined', () => {
    const isUndefinedEmpty = isEmpty(undefined);
    expect(isUndefinedEmpty).toBeTrue();
  });

  it('should return true, whether the value is an empty string', () => {
    const isStringEmpty = isEmpty(' ');
    expect(isStringEmpty).toBeTrue();
  });

  it('should return true, whether the value is an array without values', () => {
    const isArrayEmpty = isEmpty([]);
    expect(isArrayEmpty).toBeTrue();
  });

  it('should return true, whether the value is an object empty', () => {
    const isObjectEmpty = isEmpty({});
    expect(isObjectEmpty).toBeTrue();
  });

  it('should return false, whether the value is a number', () => {
    const isNumberEmpty = isEmpty(1);
    expect(isNumberEmpty).toBeFalse();
  });

  it('should return false, whether the value is a non empty string', () => {
    const isStringEmpty = isEmpty('test');
    expect(isStringEmpty).toBeFalse();
  });

  it('should return false, whether the value is a non empty array', () => {
    const isArrayEmpty = isEmpty([1]);
    expect(isArrayEmpty).toBeFalse();
  });

  it('should return false, whether the value is an object with any data', () => {
    const isObjectEmpty = isEmpty({ data: 1 });
    expect(isObjectEmpty).toBeFalse();
  });
});
