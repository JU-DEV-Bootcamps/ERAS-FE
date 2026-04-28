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
