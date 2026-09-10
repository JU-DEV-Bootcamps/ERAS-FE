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

  it('should run exportToPDF end-to-end and invoke the callback', done => {
    service.exportToPDF(element, 'test-report', 200, 100, 0, () => {
      expect(true).toBe(true);
      done();
    });
  });

  it('should run exportToPDF with a title and invoke the callback', done => {
    service.exportToPDF(
      element,
      'test-report',
      200,
      100,
      0,
      () => {
        expect(true).toBe(true);
        done();
      },
      'Student: Sample Report'
    );
  });

  describe('adjustSliceForSafeBreak', () => {
    it('should return the original slice when no forbidden zone crosses the cut point', () => {
      const internals = service as unknown as PdfServiceInternals;

      const result = internals.adjustSliceForSafeBreak(0, 500, [
        { top: 600, bottom: 650 },
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
