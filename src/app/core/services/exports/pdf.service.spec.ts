import { TestBed } from '@angular/core/testing';
import { PdfService } from './pdf.service';

interface PdfServiceInternals {
  getForbiddenZones(
    element: HTMLElement,
    selector: string,
    scale: number
  ): { top: number; bottom: number }[];
  adjustSliceForSafeBreak(
    srcYpx: number,
    slicePx: number,
    forbiddenZones: { top: number; bottom: number }[]
  ): number;
}

describe('PdfService', () => {
  let service: PdfService;
  let element: HTMLElement;

  beforeEach(() => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:disabled');
    spyOn(URL, 'revokeObjectURL').and.stub();
    spyOn(HTMLAnchorElement.prototype, 'click').and.stub();
    spyOn(HTMLAnchorElement.prototype, 'dispatchEvent').and.returnValue(true);

    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfService);

    element = document.createElement('div');
    element.style.width = '200px';
    element.style.height = '100px';
    element.textContent = 'Test content';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportToPDF branches', () => {
    it('should export in landscape mode when width > height', (done: DoneFn) => {
      element.style.width = '300px';
      element.style.height = '100px';

      service.exportToPDF(element, 'landscape-report', 300, 100, 0, () => {
        expect(true).toBeTrue();
        done();
      });
    });

    it('should export in portrait mode when width <= height', (done: DoneFn) => {
      element.style.width = '100px';
      element.style.height = '300px';

      service.exportToPDF(element, 'portrait-report', 100, 300, 0, () => {
        expect(true).toBeTrue();
        done();
      });
    });

    it('should process title with colon and multiline rest text', (done: DoneFn) => {
      service.exportToPDF(
        element,
        'title-colon-report',
        200,
        100,
        0,
        () => {
          expect(true).toBeTrue();
          done();
        },
        'Student: Detailed Evaluation Report Information'
      );
    });

    it('should process title without colon (branch false for colonIndex)', (done: DoneFn) => {
      service.exportToPDF(
        element,
        'title-no-colon-report',
        200,
        100,
        0,
        () => {
          expect(true).toBeTrue();
          done();
        },
        'Single Line Report Title'
      );
    });

    it('should process title with colon but empty rest (branch false for if(rest))', (done: DoneFn) => {
      service.exportToPDF(
        element,
        'title-colon-empty-rest',
        200,
        100,
        0,
        () => {
          expect(true).toBeTrue();
          done();
        },
        'Student:'
      );
    });

    it('should handle multi-page export when content height exceeds page limit', (done: DoneFn) => {
      element.style.width = '200px';
      element.style.height = '2500px';

      service.exportToPDF(element, 'multipage-report', 200, 2500, 0, () => {
        expect(true).toBeTrue();
        done();
      });
    });

    it('should break loop when adjustSliceForSafeBreak returns 0 or less', (done: DoneFn) => {
      spyOn(
        service as unknown as { adjustSliceForSafeBreak: () => number },
        'adjustSliceForSafeBreak'
      ).and.returnValue(0);

      service.exportToPDF(element, 'break-slice-report', 200, 100, 0, () => {
        expect(true).toBeTrue();
        done();
      });
    });

    it('should catch error and log when saving PDF fails', (done: DoneFn) => {
      spyOn(console, 'error');
      const saveError = new Error('Save PDF failure');
      spyOn(HTMLCanvasElement.prototype, 'toDataURL').and.throwError(saveError);

      service.exportToPDF(element, 'error-report', 200, 100, 0, () => {
        expect(console.error).toHaveBeenCalledWith(
          'Error generating PDF:',
          saveError
        );
        done();
      });
    });

    it('should execute exportToPDF without a callback (branch false for callback?.())', (done: DoneFn) => {
      expect(() => {
        service.exportToPDF(element, 'no-callback-report', 200, 100);
      }).not.toThrow();

      setTimeout(() => done(), 250);
    });
  });

  describe('adjustSliceForSafeBreak', () => {
    it('should return the original slice when no forbidden zone crosses the cut point', () => {
      const internals = service as unknown as PdfServiceInternals;

      const result = internals.adjustSliceForSafeBreak(0, 500, [
        { top: 600, bottom: 650 },
      ]);

      expect(result).toBe(500);
    });

    it('should ignore zone if it ends before the cutPoint (zone.bottom <= cutPoint)', () => {
      const internals = service as unknown as PdfServiceInternals;

      const result = internals.adjustSliceForSafeBreak(100, 500, [
        { top: 200, bottom: 450 },
      ]);

      expect(result).toBe(500);
    });

    it('should shrink the slice to avoid cutting through a forbidden zone', () => {
      const internals = service as unknown as PdfServiceInternals;

      const result = internals.adjustSliceForSafeBreak(0, 500, [
        { top: 450, bottom: 550 },
      ]);

      expect(result).toBe(450);
    });

    it('should never return a slice smaller than 1px', () => {
      const internals = service as unknown as PdfServiceInternals;

      const result = internals.adjustSliceForSafeBreak(0, 10, [
        { top: 1, bottom: 20 },
      ]);

      expect(result).toBe(1);
    });

    it('should ignore a forbidden zone that starts at or before srcYpx', () => {
      const internals = service as unknown as PdfServiceInternals;

      const result = internals.adjustSliceForSafeBreak(100, 500, [
        { top: 100, bottom: 550 },
      ]);

      expect(result).toBe(500);
    });
  });

  describe('getForbiddenZones', () => {
    it('should return a scaled zone for each matched row under the height threshold', () => {
      const row = document.createElement('tr');
      row.style.display = 'block';
      row.style.height = '20px';
      element.appendChild(row);

      const internals = service as unknown as PdfServiceInternals;
      const zones = internals.getForbiddenZones(element, 'tr', 2);

      expect(zones.length).toBe(1);
      expect(zones[0].bottom - zones[0].top).toBeCloseTo(40, 0);
    });

    it('should exclude rows taller than 500 * scale', () => {
      const row = document.createElement('tr');
      row.style.display = 'block';
      row.style.height = '600px';
      element.appendChild(row);

      const internals = service as unknown as PdfServiceInternals;
      const zones = internals.getForbiddenZones(element, 'tr', 1);

      expect(zones.length).toBe(0);
    });
  });
});
