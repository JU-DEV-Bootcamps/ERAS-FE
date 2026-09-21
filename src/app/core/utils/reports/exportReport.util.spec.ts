import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PdfService } from '@core/services/exports/pdf.service';
import { FileNameUtils } from '@core/utils/file/file-name';
import { ExportArgs } from '../../../modules/reports/components/summary-charts/types/export';
import {
  DEFAULT_VALUES,
  SNACKBAR_CONF,
} from '../../../modules/reports/components/summary-charts/constants/export-conf';
import { PdfHelper } from './exportReport.util';

describe('PdfHelper', () => {
  let service: PdfHelper;
  let pdfServiceSpy: jasmine.SpyObj<PdfService>;

  beforeEach(() => {
    pdfServiceSpy = jasmine.createSpyObj('PdfService', ['exportToPDF']);

    TestBed.configureTestingModule({
      providers: [PdfHelper, { provide: PdfService, useValue: pdfServiceSpy }],
    });

    service = TestBed.inject(PdfHelper);
    spyOn(
      service as unknown as { waitForReflow: () => Promise<void> },
      'waitForReflow'
    ).and.returnValue(Promise.resolve());
  });

  describe('preProcessHTML', () => {
    it('should apply student-detail preprocess rules and remove unwanted elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="student-header"></div>
        <div class="info-value">Value</div>
        <div class="info-field">Field</div>
        <div class="info-fields-row"></div>
        <div class="student-info-grid"></div>
        <div class="card-performance">
          <div class="card-title"></div>
          <div class="metric-label"></div>
          <div class="metric-value"></div>
        </div>
        <div class="card-risk">
          <div class="card-title"></div>
          <div class="apexcharts-canvas"></div>
        </div>
        <div id="chart-student-detail"></div>
        <table>
          <tr><th>Head</th><td>Data</td></tr>
        </table>
        <svg>
          <tspan>Span Text</tspan>
          <g class="apexcharts-inner apexcharts-graphical"></g>
          <g class="apexcharts-yaxis-label"><text x="100">Label with X</text></g>
          <g class="apexcharts-yaxis"><text>Label without X</text></g>
        </svg>
        <button id="action-btn">Click</button>
        <div id="print-button"></div>
        <mat-paginator></mat-paginator>
      `;

      service.preProcessHTML(container, 'student-detail');

      expect(container.querySelector('h1')?.textContent).toBe(
        'Student Details'
      );
      expect(
        container
          .querySelector('#chart-student-detail')
          ?.classList.contains('print-chart')
      ).toBeTrue();
      expect(container.querySelector('button')).toBeNull();
      expect(container.querySelector('#print-button')).toBeNull();
      expect(container.querySelector('mat-paginator')).toBeNull();
      expect(container.querySelector('th')?.style.fontSize).toBe('1.3em');
      expect(container.querySelector('td')?.style.fontSize).toBe('1.3em');
      expect(container.querySelector('tspan')?.style.fontSize).toBe('1.6em');
    });

    it('should safely handle student-detail when optional inner elements are missing (branch false checks)', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="card-performance"></div>
        <div class="card-risk"></div>
      `;

      expect(() => {
        service.preProcessHTML(container, 'student-detail');
      }).not.toThrow();
    });

    it('should apply list preprocess rules and remove selection columns', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="isSelectedHeader"></div>
        <div id="isSelectedCheckbox"></div>
        <div class="action-column-header"></div>
        <div class="action-column-cell"></div>
        <mat-paginator></mat-paginator>
      `;

      service.preProcessHTML(container, 'list');

      expect(container.querySelector('#isSelectedHeader')).toBeNull();
      expect(container.querySelector('#isSelectedCheckbox')).toBeNull();
      expect(container.querySelector('.action-column-header')).toBeNull();
      expect(container.querySelector('.action-column-cell')).toBeNull();
      expect(container.querySelector('mat-paginator')).toBeNull();
    });

    it('should do nothing if preprocess key is not found', () => {
      const container = document.createElement('div');
      container.innerHTML = '<span class="keep-me">Text</span>';

      service.preProcessHTML(container, 'unknown-key');

      expect(container.querySelector('.keep-me')).not.toBeNull();
    });
  });

  describe('printReportInfo', () => {
    it('should clone element, adjust styles, clean up buttons, and move title/legends', () => {
      const source = document.createElement('div');
      source.innerHTML = `
        <div id="swiper-container" effect="cube"></div>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <p>Paragraph</p>
        <div id="print-button"></div>
        <div class="form-container"></div>
        <div class="filter-container"></div>
        <div class="title-card"></div>
        <div class="apexcharts-tooltip"></div>
        <mat-card-actions></mat-card-actions>
        <div class="chart-wrapper">
          <div class="apexcharts-canvas">
            <svg>
              <text class="apexcharts-title-text">Chart Title</text>
            </svg>
            <div class="apexcharts-legend">
              <div class="apexcharts-legend-series"></div>
            </div>
          </div>
        </div>
        <div class="container-card-list"></div>
        <div class="chart-container"></div>
      `;

      const mainContainer = new ElementRef(source);
      const cloned = service.printReportInfo(mainContainer);

      expect(
        cloned.querySelector('#swiper-container')?.hasAttribute('effect')
      ).toBeFalse();
      expect(cloned.querySelector('#print-button')).toBeNull();
      expect(cloned.querySelector('.form-container')).toBeNull();
      expect(cloned.querySelector('.filter-container')).toBeNull();
      expect(cloned.querySelector('.title-card')).toBeNull();
      expect(cloned.querySelector('.apexcharts-tooltip')).toBeNull();
      expect(cloned.querySelector('mat-card-actions')).toBeNull();
      expect(cloned.textContent).toContain('Chart Title');
    });

    it('should safely process canvas without title, legend or parent element (branch false checks)', () => {
      const source = document.createElement('div');
      source.innerHTML = `
        <div class="apexcharts-canvas">
          <svg>
            <text class="apexcharts-title-text">   </text>
          </svg>
        </div>
      `;

      const mainContainer = new ElementRef(source);
      const cloned = service.printReportInfo(mainContainer);

      expect(cloned.querySelector('.container-card-list')).toBeNull();
      expect(cloned.querySelector('.chart-container')).toBeNull();
    });

    it('should call preProcessHTML when preProcess argument is provided', () => {
      const spy = spyOn(service, 'preProcessHTML');
      const source = document.createElement('div');
      const mainContainer = new ElementRef(source);

      service.printReportInfo(mainContainer, 'list');

      expect(spy).toHaveBeenCalledWith(jasmine.any(HTMLElement), 'list');
    });
  });

  describe('measureAndPrepare branches', () => {
    it('should calculate landscape dimensions and format SVG with existing viewBox', async () => {
      const source = document.createElement('div');
      source.innerHTML = `
        <div style="height: 10px; width: 100%;"></div>
        <div class="parent-canvas">
          <div class="apexcharts-canvas">
            <svg viewBox="0 0 500 300"></svg>
          </div>
        </div>
      `;

      pdfServiceSpy.exportToPDF.and.callFake((cloned, fileName, w) => {
        expect(w).toBe(1056);
        return Promise.resolve();
      });

      const args: ExportArgs = {
        container: new ElementRef(source),
      } as unknown as ExportArgs;

      await service.exportToPdf(args);
    });

    it('should calculate portrait dimensions and fallback SVG attributes when missing', async () => {
      const source = document.createElement('div');
      source.innerHTML = `
        <div style="height: 3000px; width: 100%;"></div>
        <div class="apexcharts-canvas">
          <svg></svg>
        </div>
        <div class="apexcharts-canvas"></div>
      `;

      pdfServiceSpy.exportToPDF.and.callFake((cloned, fileName, w) => {
        expect(w).toBe(816);
        return Promise.resolve();
      });

      const args: ExportArgs = {
        container: new ElementRef(source),
      } as unknown as ExportArgs;

      await service.exportToPdf(args);
    });
  });

  describe('exportToPdf', () => {
    it('should process export and notify snackbar on start and completion', async () => {
      const source = document.createElement('div');
      const snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', [
        'open',
      ]);
      spyOn(FileNameUtils, 'generateFileName').and.returnValue(
        'file_report_2026'
      );

      pdfServiceSpy.exportToPDF.and.callFake(
        (cloned, fileName, w, h, m, callback) => {
          document.body.appendChild(cloned);
          if (callback) callback();
          return Promise.resolve();
        }
      );

      const args: ExportArgs = {
        container: new ElementRef(source),
        fileName: 'report',
        snackBar: snackBarSpy,
      } as unknown as ExportArgs;

      await service.exportToPdf(args);

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        SNACKBAR_CONF.message_start,
        'Close',
        jasmine.objectContaining({ duration: SNACKBAR_CONF.duration })
      );
      expect(pdfServiceSpy.exportToPDF).toHaveBeenCalledWith(
        jasmine.any(HTMLElement),
        'file_report_2026',
        jasmine.any(Number),
        jasmine.any(Number),
        0,
        jasmine.any(Function)
      );
      expect(snackBarSpy.open).toHaveBeenCalledWith(
        SNACKBAR_CONF.message_end,
        'OK',
        jasmine.objectContaining({ duration: SNACKBAR_CONF.duration })
      );
    });

    it('should export without snackbar and fallback to default fileName when not provided', async () => {
      const source = document.createElement('div');
      spyOn(FileNameUtils, 'generateFileName').and.callThrough();

      pdfServiceSpy.exportToPDF.and.callFake(
        (cloned, fileName, w, h, m, callback) => {
          if (callback) callback();
          return Promise.resolve();
        }
      );

      const args: ExportArgs = {
        container: new ElementRef(source),
      } as unknown as ExportArgs;

      await service.exportToPdf(args);

      expect(FileNameUtils.generateFileName).toHaveBeenCalledWith(
        DEFAULT_VALUES.fileName
      );
      expect(pdfServiceSpy.exportToPDF).toHaveBeenCalled();
    });
  });

  describe('exportCardToPdf', () => {
    it('should prepare collapsible card content, hide action buttons, and trigger PDF export', async () => {
      const source = document.createElement('div');
      source.innerHTML = `
        <div class="card-body">Content</div>
        <div class="pdf-export">Button</div>
        <div class="card-actions">Actions</div>
      `;

      Object.defineProperty(source, 'offsetWidth', {
        value: 500,
        configurable: true,
      });

      spyOn(FileNameUtils, 'generateFileName').and.returnValue(
        'file_card_2026'
      );

      pdfServiceSpy.exportToPDF.and.callFake(
        (cloned, fileName, w, h, m, callback) => {
          document.body.appendChild(cloned);
          if (callback) callback();
          return Promise.resolve();
        }
      );

      const args: ExportArgs = {
        container: new ElementRef(source),
        fileName: 'custom-card-file',
        title: 'Card Title',
      } as unknown as ExportArgs;

      await service.exportCardToPdf(args);

      expect(pdfServiceSpy.exportToPDF).toHaveBeenCalledWith(
        jasmine.any(HTMLElement),
        'file_card_2026',
        jasmine.any(Number),
        jasmine.any(Number),
        0,
        jasmine.any(Function),
        'Card Title'
      );
    });

    it('should handle card without collapsible content', async () => {
      const source = document.createElement('div');
      source.innerHTML = `<div>Simple content without collapsible classes</div>`;

      pdfServiceSpy.exportToPDF.and.callFake(
        (cloned, fileName, w, h, m, callback) => {
          if (callback) callback();
          return Promise.resolve();
        }
      );

      const args: ExportArgs = {
        container: new ElementRef(source),
      } as unknown as ExportArgs;

      await service.exportCardToPdf(args);

      expect(pdfServiceSpy.exportToPDF).toHaveBeenCalled();
    });
  });
});
