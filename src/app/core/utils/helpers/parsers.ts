import {
  isStudentImportKey,
  StudentImport,
} from '@core/services/interfaces/student.interface';

export function parseRowErrors(flatErrors: string[]): Map<number, string[]> {
  const map = new Map<number, string[]>();
  for (const entry of flatErrors) {
    const match = entry.match(/^Row (\d+):\s*(.+)$/);
    if (!match) continue;
    const rowIndex = parseInt(match[1], 10) - 1;
    const errors = match[2]
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);
    map.set(rowIndex, errors);
  }
  return map;
}
export function getHeadersErrors(flatErrors: string[]): string[] {
  const errorsHeader = [];
  for (const entry of flatErrors) {
    if (entry.includes('header')) {
      errorsHeader.push(entry);
    }
  }
  return errorsHeader;
}
export function parseJsonRows(rows: Record<string, string>[]) {
  return rows.map((row: Record<string, string>): StudentImport => {
    const filteredRow = {} as StudentImport;

    for (const key in row) {
      if (key !== '' && isStudentImportKey(key)) {
        const value = row[key];

        if (typeof value === 'string' && value.includes(',')) {
          row[key] = value.replace(',', '.');
        }
        filteredRow[key] = row[key];
      }
    }
    return filteredRow;
  });
}
