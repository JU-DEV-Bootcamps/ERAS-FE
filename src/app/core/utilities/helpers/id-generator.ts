//NOTE: Ids should be generated in the backend side, this could
//lead to duplicated identifiers.
const maxNumber = 2147483647;

export function idGenerator(): number {
  return Math.floor(Math.random() * maxNumber);
}
