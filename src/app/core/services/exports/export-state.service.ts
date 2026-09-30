import { Injectable, signal } from '@angular/core';

export type ExportType = 'csv' | 'pdf' | null;

@Injectable({
  providedIn: 'root',
})
export class ExportStateService {
  exportType = signal<ExportType>(null);
  isExporting = signal<boolean>(false);
  progress = signal<number>(0);
  estimatedTimeRemaining = signal<number>(0);
  message = signal<string>('');

  private itemCount = 0;
  private startTime = 0;

  startExport(type: ExportType, itemCount = 0): void {
    this.exportType.set(type);
    this.itemCount = itemCount;
    this.startTime = Date.now();
    this.progress.set(0);

    const estimatedSeconds = this.calculateEstimatedTime(type, itemCount);
    this.estimatedTimeRemaining.set(estimatedSeconds);

    const message =
      type === 'csv'
        ? 'Exporting to CSV...'
        : `Generating PDF (estimated ${estimatedSeconds}s)...`;
    this.message.set(message);

    this.isExporting.set(true);
  }

  endExport(): void {
    this.isExporting.set(false);
    this.exportType.set(null);
    this.progress.set(0);
    this.message.set('');
  }

  updateProgress(current: number, total: number): void {
    const percentage = Math.round((current / total) * 100);
    this.progress.set(percentage);

    if (this.exportType() === 'pdf') {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.message.set(
        `Processing page ${current} of ${total}... (${elapsedSeconds}s)`
      );
    }
  }

  private calculateEstimatedTime(type: ExportType, itemCount: number): number {
    if (type === 'csv') {
      return itemCount > 1000 ? 3 : 1;
    }

    if (type === 'pdf') {
      const baseTime = 2;
      const itemTime = itemCount > 100 ? 0.05 : 0.02;
      return Math.max(
        2,
        Math.min(60, Math.round(baseTime + itemCount * itemTime))
      );
    }

    return 0;
  }
}
