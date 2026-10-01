import { Injectable, signal } from '@angular/core';

export type ExportType = 'csv' | 'pdf' | null;
export type ExportDisplayMode = 'blocking' | 'background';

const CSV_OVERLAY_DELAY_MS = 400;
const BACKGROUND_THRESHOLD_MS = 60_000;

@Injectable({
  providedIn: 'root',
})
export class ExportStateService {
  exportType = signal<ExportType>(null);
  isExporting = signal<boolean>(false);
  shouldShowOverlay = signal<boolean>(false);
  progress = signal<number>(0);
  estimatedTimeRemaining = signal<number>(0);
  message = signal<string>('');
  displayMode = signal<ExportDisplayMode>('blocking');

  private startTime = 0;
  private overlayTimer: ReturnType<typeof setTimeout> | null = null;
  private backgroundTimer: ReturnType<typeof setTimeout> | null = null;

  startExport(type: ExportType, itemCount = 0): void {
    this.exportType.set(type);
    this.startTime = Date.now();
    this.progress.set(0);
    this.displayMode.set('blocking');

    if (this.backgroundTimer !== null) {
      clearTimeout(this.backgroundTimer);
    }
    this.backgroundTimer = setTimeout(() => {
      if (this.isExporting()) {
        this.displayMode.set('background');
      }
    }, BACKGROUND_THRESHOLD_MS);

    const estimatedSeconds = this.calculateEstimatedTime(type, itemCount);
    this.estimatedTimeRemaining.set(estimatedSeconds);

    const message =
      type === 'csv'
        ? 'Exporting to CSV...'
        : `Generating PDF (estimated ${estimatedSeconds}s)...`;
    this.message.set(message);

    this.isExporting.set(true);

    if (type === 'pdf') {
      this.shouldShowOverlay.set(true);
    } else {
      this.overlayTimer = setTimeout(() => {
        if (this.isExporting()) {
          this.shouldShowOverlay.set(true);
        }
      }, CSV_OVERLAY_DELAY_MS);
    }
  }

  endExport(): void {
    if (this.overlayTimer !== null) {
      clearTimeout(this.overlayTimer);
      this.overlayTimer = null;
    }
    if (this.backgroundTimer !== null) {
      clearTimeout(this.backgroundTimer);
      this.backgroundTimer = null;
    }
    this.isExporting.set(false);
    this.shouldShowOverlay.set(false);
    this.exportType.set(null);
    this.progress.set(0);
    this.message.set('');
    this.displayMode.set('blocking');
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
