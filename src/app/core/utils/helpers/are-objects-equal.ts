import { areArraysEqual } from './are-arrays-equal';

export function areObjectsEqual<T>(obj1: T, obj2: T): boolean {
  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const obj1Keys = Object.keys(obj1) as (keyof typeof obj1)[];
  const obj2Keys = Object.keys(obj2) as (keyof typeof obj2)[];

  if (obj1Keys.length !== obj2Keys.length) return false;

  return obj1Keys.every(key => {
    const propertyExists = Object.prototype.hasOwnProperty.call(obj2, key);
    const isValueArray = Array.isArray(obj1[key]);
    const isValueObject = typeof obj1[key] === 'object';

    if (!propertyExists) return false;

    if (isValueArray)
      return areArraysEqual<unknown>(
        obj1[key] as unknown[],
        obj2[key] as unknown[]
      );

    if (isValueObject) return areObjectsEqual(obj1[key], obj2[key]);

    return obj1[key] === obj2[key];
  });
}
