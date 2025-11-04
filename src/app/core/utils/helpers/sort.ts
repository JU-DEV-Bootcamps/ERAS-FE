type Order = 'asc' | 'desc';

export function sortArray<T>(
  array: T[],
  property: keyof T,
  order: Order = 'asc'
): T[] {
  //Shallow copy to avoid modify the original.
  const sortedArray = [...array];

  sortedArray.sort((objA, objB) => {
    const valueA = objA[property];
    const valueB = objB[property];

    // Strings comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return order === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    //Numbers comparison
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return order === 'asc' ? valueA - valueB : valueB - valueA;
    }

    return 0;
  });

  return sortedArray;
}
