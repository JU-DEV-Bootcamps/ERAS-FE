import {
  estimateExportTime,
  shouldShowOverlay,
  formatTimeRemaining,
  DEFAULT_TIMING_CONFIG,
  ExportTimingConfig,
} from './export-timing.util';

describe('export-timing.util', () => {
  describe('estimateExportTime', () => {
    it('returns at least 1 for csv with 0 items', () => {
      expect(estimateExportTime('csv', 0)).toBe(1);
    });

    it('returns at least 1 for pdf with 0 items', () => {
      expect(estimateExportTime('pdf', 0)).toBe(2);
    });

    it('uses default itemCount of 0 when not provided', () => {
      expect(estimateExportTime('csv')).toBe(1);
    });

    it('adds item time for csv with large itemCount (>= 20000 items → >1s)', () => {
      const result = estimateExportTime('csv', 20000);
      expect(result).toBeGreaterThan(1);
    });

    it('adds item time for pdf with large itemCount', () => {
      const result = estimateExportTime('pdf', 10000);
      expect(result).toBeGreaterThan(2);
    });

    it('uses custom config values for csv', () => {
      const config: ExportTimingConfig = {
        csvBaseTime: 500,
        pdfBaseTime: 2000,
        itemTimePercentage: 0.1,
        minShowTime: 500,
      };
      const result = estimateExportTime('csv', 0, config);
      expect(result).toBe(1);
    });

    it('uses custom config values for pdf', () => {
      const config: ExportTimingConfig = {
        csvBaseTime: 100,
        pdfBaseTime: 5000,
        itemTimePercentage: 0.05,
        minShowTime: 500,
      };
      const result = estimateExportTime('pdf', 0, config);
      expect(result).toBe(5);
    });

    it('always returns a positive integer (min 1)', () => {
      const config: ExportTimingConfig = {
        csvBaseTime: 0,
        pdfBaseTime: 0,
        itemTimePercentage: 0,
        minShowTime: 500,
      };
      expect(estimateExportTime('csv', 0, config)).toBe(1);
      expect(estimateExportTime('pdf', 0, config)).toBe(1);
    });

    it('rounds up fractional seconds', () => {
      const config: ExportTimingConfig = {
        csvBaseTime: 1500,
        pdfBaseTime: 2000,
        itemTimePercentage: 0,
        minShowTime: 500,
      };
      expect(estimateExportTime('csv', 0, config)).toBe(2);
    });
  });

  describe('shouldShowOverlay', () => {
    it('returns false when elapsedMs is below threshold', () => {
      expect(shouldShowOverlay(499)).toBeFalse();
    });

    it('returns true when elapsedMs equals the threshold (boundary)', () => {
      expect(shouldShowOverlay(500)).toBeTrue();
    });

    it('returns true when elapsedMs exceeds the threshold', () => {
      expect(shouldShowOverlay(1000)).toBeTrue();
    });

    it('returns false for negative elapsedMs', () => {
      expect(shouldShowOverlay(-1)).toBeFalse();
    });

    it('uses custom config minShowTime', () => {
      const config: ExportTimingConfig = {
        ...DEFAULT_TIMING_CONFIG,
        minShowTime: 1000,
      };
      expect(shouldShowOverlay(999, config)).toBeFalse();
      expect(shouldShowOverlay(1000, config)).toBeTrue();
    });
  });

  describe('formatTimeRemaining', () => {
    it('returns "<1s" for 0 seconds', () => {
      expect(formatTimeRemaining(0)).toBe('<1s');
    });

    it('returns "<1s" for negative seconds', () => {
      expect(formatTimeRemaining(-5)).toBe('<1s');
    });

    it('returns seconds format for 1 second', () => {
      expect(formatTimeRemaining(1)).toBe('1s');
    });

    it('returns seconds format for 59 seconds', () => {
      expect(formatTimeRemaining(59)).toBe('59s');
    });

    it('returns minutes format for exactly 60 seconds', () => {
      expect(formatTimeRemaining(60)).toBe('1m 0s');
    });

    it('returns minutes format for 61 seconds', () => {
      expect(formatTimeRemaining(61)).toBe('1m 1s');
    });

    it('returns minutes format for 90 seconds', () => {
      expect(formatTimeRemaining(90)).toBe('1m 30s');
    });

    it('returns minutes format for 120 seconds', () => {
      expect(formatTimeRemaining(120)).toBe('2m 0s');
    });

    it('returns minutes format for 125 seconds', () => {
      expect(formatTimeRemaining(125)).toBe('2m 5s');
    });
  });
});
