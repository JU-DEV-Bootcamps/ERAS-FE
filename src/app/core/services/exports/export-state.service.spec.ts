import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ExportStateService } from './export-state.service';

describe('ExportStateService', () => {
  let service: ExportStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have all signals at default values', () => {
      expect(service.exportType()).toBeNull();
      expect(service.isExporting()).toBeFalse();
      expect(service.shouldShowOverlay()).toBeFalse();
      expect(service.progress()).toBe(0);
      expect(service.estimatedTimeRemaining()).toBe(0);
      expect(service.message()).toBe('');
    });
  });

  describe('startExport', () => {
    afterEach(() => {
      service.endExport();
    });

    it('sets isExporting to true', () => {
      service.startExport('csv');
      expect(service.isExporting()).toBeTrue();
    });

    it('resets progress to 0', () => {
      service.updateProgress(50, 100);
      service.startExport('csv');
      expect(service.progress()).toBe(0);
    });

    it('sets exportType to csv', () => {
      service.startExport('csv');
      expect(service.exportType()).toBe('csv');
    });

    it('sets exportType to pdf', () => {
      service.startExport('pdf');
      expect(service.exportType()).toBe('pdf');
    });

    it('sets CSV message without estimated time', () => {
      service.startExport('csv');
      expect(service.message()).toBe('Exporting to CSV...');
    });

    it('sets PDF message with estimated time', () => {
      service.startExport('pdf', 50);
      expect(service.message()).toContain('Generating PDF');
      expect(service.message()).toContain('estimated');
    });

    it('immediately shows overlay for pdf', () => {
      service.startExport('pdf');
      expect(service.shouldShowOverlay()).toBeTrue();
    });

    it('does not show overlay immediately for csv', () => {
      service.startExport('csv');
      expect(service.shouldShowOverlay()).toBeFalse();
    });

    it('shows overlay after 400ms delay for csv when still exporting', fakeAsync(() => {
      service.startExport('csv');
      tick(400);
      expect(service.shouldShowOverlay()).toBeTrue();
    }));

    it('does not show overlay after timer if export already ended', fakeAsync(() => {
      service.startExport('csv');
      service.endExport();
      tick(400);
      expect(service.shouldShowOverlay()).toBeFalse();
    }));

    it('handles null exportType without throwing', () => {
      expect(() => service.startExport(null)).not.toThrow();
      expect(service.isExporting()).toBeTrue();
      expect(service.exportType()).toBeNull();
    });

    it('sets estimatedTimeRemaining for csv with few items', () => {
      service.startExport('csv', 100);
      expect(service.estimatedTimeRemaining()).toBe(1);
    });

    it('sets estimatedTimeRemaining for csv with many items (>1000)', () => {
      service.startExport('csv', 1001);
      expect(service.estimatedTimeRemaining()).toBe(3);
    });

    it('sets estimatedTimeRemaining for csv with exactly 1000 items (boundary → 1)', () => {
      service.startExport('csv', 1000);
      expect(service.estimatedTimeRemaining()).toBe(1);
    });

    it('uses small itemTime for pdf with <= 100 items', () => {
      service.startExport('pdf', 100);
      const est = service.estimatedTimeRemaining();
      expect(est).toBeGreaterThanOrEqual(2);
    });

    it('uses larger itemTime for pdf with > 100 items', () => {
      service.startExport('pdf', 101);
      const estSmall = service.estimatedTimeRemaining();
      service.endExport();
      service.startExport('pdf', 100);
      const estLarge = service.estimatedTimeRemaining();
      expect(estSmall).toBeGreaterThanOrEqual(estLarge);
    });

    it('caps pdf estimated time at 60s for very large item counts', () => {
      service.startExport('pdf', 10000);
      expect(service.estimatedTimeRemaining()).toBe(60);
    });
  });

  describe('endExport', () => {
    it('resets all signals to defaults', () => {
      service.startExport('pdf', 50);
      service.endExport();

      expect(service.isExporting()).toBeFalse();
      expect(service.shouldShowOverlay()).toBeFalse();
      expect(service.exportType()).toBeNull();
      expect(service.progress()).toBe(0);
      expect(service.message()).toBe('');
    });

    it('clears the csv overlay timer so it does not fire', fakeAsync(() => {
      service.startExport('csv');
      service.endExport();
      tick(400);
      expect(service.shouldShowOverlay()).toBeFalse();
    }));

    it('can be called multiple times without throwing', () => {
      service.startExport('csv');
      expect(() => {
        service.endExport();
        service.endExport();
      }).not.toThrow();
    });
  });

  describe('updateProgress', () => {
    beforeEach(() => {
      service.startExport('pdf', 10);
    });

    afterEach(() => {
      service.endExport();
    });

    it('sets progress as a percentage', () => {
      service.updateProgress(50, 100);
      expect(service.progress()).toBe(50);
    });

    it('sets progress to 100 when current equals total', () => {
      service.updateProgress(5, 5);
      expect(service.progress()).toBe(100);
    });

    it('updates message for pdf export type', () => {
      service.updateProgress(2, 10);
      expect(service.message()).toContain('Processing page 2 of 10');
    });

    it('does not update message for csv export type', () => {
      service.endExport();
      service.startExport('csv');
      const csvMessage = service.message();
      service.updateProgress(1, 5);
      expect(service.message()).toBe(csvMessage);
    });

    it('handles division by zero gracefully (total = 0)', () => {
      expect(() => service.updateProgress(0, 0)).not.toThrow();
    });

    it('does not throw when called after endExport (null exportType)', () => {
      service.endExport();
      expect(() => service.updateProgress(1, 5)).not.toThrow();
    });
  });
});
