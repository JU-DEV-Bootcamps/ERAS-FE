import { sortArray } from './sort';

describe('sortArray', () => {
  it('should return an string array ordered asc by default', () => {
    const sortedArray = sortArray(
      [{ name: 'third' }, { name: 'first' }, { name: 'second' }],
      'name'
    );
    expect(sortedArray).toEqual([
      { name: 'first' },
      { name: 'second' },
      { name: 'third' },
    ]);
  });

  it('should return an string array ordered asc as a parameter', () => {
    const sortedArray = sortArray(
      [{ name: 'third' }, { name: 'first' }, { name: 'second' }],
      'name',
      'asc'
    );
    expect(sortedArray).toEqual([
      { name: 'first' },
      { name: 'second' },
      { name: 'third' },
    ]);
  });

  it('should return an string array ordered desc as a parameter', () => {
    const sortedArray = sortArray(
      [{ name: 'third' }, { name: 'first' }, { name: 'second' }],
      'name',
      'desc'
    );
    expect(sortedArray).toEqual([
      { name: 'third' },
      { name: 'second' },
      { name: 'first' },
    ]);
  });

  it('should return a number array ordered asc by default', () => {
    const sortedArray = sortArray([{ age: 7 }, { age: 5 }, { age: 3 }], 'age');
    expect(sortedArray).toEqual([{ age: 3 }, { age: 5 }, { age: 7 }]);
  });

  it('should return a number array ordered asc as a parameter', () => {
    const sortedArray = sortArray(
      [{ age: 7 }, { age: 5 }, { age: 3 }],
      'age',
      'asc'
    );
    expect(sortedArray).toEqual([{ age: 3 }, { age: 5 }, { age: 7 }]);
  });

  it('should return a number array ordered desc as a parameter', () => {
    const sortedArray = sortArray(
      [{ age: 7 }, { age: 5 }, { age: 3 }],
      'age',
      'desc'
    );
    expect(sortedArray).toEqual([{ age: 7 }, { age: 5 }, { age: 3 }]);
  });
});
