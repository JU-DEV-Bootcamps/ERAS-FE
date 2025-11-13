import { areArraysEqual } from './are-arrays-equal';

describe('areArraysEqual', () => {
  it('should return false, whether the arrays have different sizes.', () => {
    const areEquals = areArraysEqual([1], [1, 2]);
    expect(areEquals).toBeFalse();
  });

  it('should return false, whether the arrays have different values', () => {
    const firstArray = [1, 'a'];
    const secondArray = ['b', 1];
    const areEquals = areArraysEqual(firstArray, secondArray);
    expect(areEquals).toBeFalse();
  });

  it('should return false, whether the arrays have different values', () => {
    const firstArray = [1, 'a'];
    const secondArray = ['b', 1];
    const areEquals = areArraysEqual(firstArray, secondArray);
    expect(areEquals).toBeFalse();
  });

  it('should return true, whether the arrays are equals', () => {
    const firstArray = [1, 'a'];
    const secondArray = [1, 'a'];
    const areEquals = areArraysEqual(firstArray, secondArray);
    expect(areEquals).toBeTrue();
  });
});
