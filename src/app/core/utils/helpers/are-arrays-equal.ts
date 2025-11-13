export function areArraysEqual<T>(firstArray: T[], secondArray: T[]): boolean {
  if (firstArray.length !== secondArray.length) return false;
  return firstArray.every((element, idx) => element === secondArray[idx]);
}
