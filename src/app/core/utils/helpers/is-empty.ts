export function isEmpty<T>(value: T): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).length === 0
  ) {
    return true;
  }

  return false;
}
