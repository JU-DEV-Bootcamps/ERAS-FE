export interface ExportTimingConfig {
  csvBaseTime: number;
  pdfBaseTime: number;
  itemTimePercentage: number; // additional ms per item
  minShowTime: number;
}

export const DEFAULT_TIMING_CONFIG: ExportTimingConfig = {
  csvBaseTime: 100,
  pdfBaseTime: 2000,
  itemTimePercentage: 0.05, // 0.05ms per item for large exports
  minShowTime: 500, // 500ms threshold for showing overlay
};

export function estimateExportTime(
  type: 'csv' | 'pdf',
  itemCount = 0,
  config: ExportTimingConfig = DEFAULT_TIMING_CONFIG
): number {
  const baseTime = type === 'csv' ? config.csvBaseTime : config.pdfBaseTime;
  const itemTime = itemCount * config.itemTimePercentage;
  const totalMs = baseTime + itemTime;

  return Math.max(1, Math.ceil(totalMs / 1000));
}

/**
 * Determine if overlay should be shown based on elapsed time
 */
export function shouldShowOverlay(
  elapsedMs: number,
  config: ExportTimingConfig = DEFAULT_TIMING_CONFIG
): boolean {
  return elapsedMs >= config.minShowTime;
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '<1s';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
