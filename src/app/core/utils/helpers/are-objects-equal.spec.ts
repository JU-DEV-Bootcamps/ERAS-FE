import { areObjectsEqual } from './are-objects-equal';

describe('areObjectsEqual', () => {
  it('should return false when the first argument is not an object', () => {
    const areEqual = areObjectsEqual([1], { a: 1 });
    expect(areEqual).toBeFalse();
  });

  it('should return false when the second argument is not an object', () => {
    const areEqual = areObjectsEqual({ a: 1 }, [1]);
    expect(areEqual).toBeFalse();
  });

  it('should return false when the first argument is null', () => {
    const areEqual = areObjectsEqual(null, { a: 1 });
    expect(areEqual).toBeFalse();
  });

  it('should return false when the second argument is null', () => {
    const areEqual = areObjectsEqual({ a: 1 }, null);
    expect(areEqual).toBeFalse();
  });

  it('should return false when the objects do not have the same amount of keys', () => {
    const areEqual = areObjectsEqual({ a: 2 }, { a: 2, b: 3 });
    expect(areEqual).toBeFalse();
  });

  it('should return false if property of object A does not exist in object B', () => {
    const areEqual = areObjectsEqual({ a: 2 }, { b: 2 });
    expect(areEqual).toBeFalse();
  });

  it('should return false if properties of type array are different', () => {
    const areEqual = areObjectsEqual({ a: [2, 3] }, { a: [3, 4] });
    expect(areEqual).toBeFalse();
  });

  it('should return true if objects with array values are the same', () => {
    const areEqual = areObjectsEqual({ a: [1, 2] }, { a: [1, 2] });
    expect(areEqual).toBeTrue();
  });

  it('should return false if embedded objects are different', () => {
    const areEqual = areObjectsEqual(
      { a: { subA: 'a' } },
      { a: { subA: 'b' } }
    );
    expect(areEqual).toBeFalse();
  });

  it('should return true if object with embedded objects are equal', () => {
    const areEqual = areObjectsEqual(
      { a: { subA: 'a' } },
      { a: { subA: 'a' } }
    );
    expect(areEqual).toBeTrue();
  });

  it('should return true if objects are equal', () => {
    const areEqual = areObjectsEqual(
      { a: ['abc', 'def', '123'], b: 123, c: 'abc' },
      { a: ['abc', 'def', '123'], b: 123, c: 'abc' }
    );
    expect(areEqual).toBeTrue();
  });
});
