import { ElementRef, inject, Injectable } from '@angular/core';
import { generateFileName } from '@core/utils/file/file-name';
import { PdfService } from '@core/services/exports/pdf.service';
import { ExportArgs } from '../../../modules/reports/components/summary-charts/types/export';
import {
  DEFAULT_VALUES,
  SNACKBAR_CONF,
  STYLE_CONF,
} from '../../../modules/reports/components/summary-charts/constants/export-conf';

const LETTER_PX = { portrait: 816, landscape: 1056 };

@Injectable({ providedIn: 'root' })
export class PdfHelper {
  pdfService = inject(PdfService);

  preProcessHTML(clonedElement: HTMLElement, key: string) {
    const processes: Record<string, (clonedElement: HTMLElement) => void> = {
      'student-detail': (clonedElement: HTMLElement) => {
        clonedElement.style.width = '1700px';
        clonedElement.style.maxWidth = '1700px';
        clonedElement.style.overflow = 'visible';

        const studentHeader = clonedElement.querySelector(
          '.student-header'
        ) as HTMLElement;
        if (studentHeader) {
          studentHeader.style.width = '70%';
          studentHeader.style.maxWidth = '70%';
          studentHeader.style.boxSizing = 'border-box';
          studentHeader.style.fontSize = '1.4em';
          studentHeader.style.padding = '16px';
        }

        const cardPerformance = clonedElement.querySelector(
          '.card-performance'
        ) as HTMLElement;
        const cardRisk = clonedElement.querySelector(
          '.card-risk'
        ) as HTMLElement;
        if (cardPerformance) {
          cardPerformance.style.width = '50%';
          cardPerformance.style.flex = '1';
        }
        if (cardRisk) {
          cardRisk.style.width = '50%';
          cardRisk.style.flex = '1';
        }

        clonedElement
          .querySelector('#chart-student-detail')
          ?.classList.add('print-chart');

        const h1 = document.createElement('h1');
        h1.textContent = 'Student Details';
        h1.style.textAlign = 'center';
        h1.style.fontSize = '2em';
        h1.style.fontWeight = '500';
        el.insertBefore(h1, el.firstChild);

        const thElements = clonedElement.querySelectorAll('th');
        thElements.forEach(th => {
          th.style.fontSize = '1.3em';
        });

        const tdElements = clonedElement.querySelectorAll('td');
        tdElements.forEach(td => {
          td.style.fontSize = '1.3em';
        });

        const tspanElements = clonedElement.querySelectorAll('tspan');
        tspanElements.forEach(tspan => {
          tspan.style.fontSize = '1.6em';
        });

        const apexInner = clonedElement.querySelector<SVGElement>(
          '.apexcharts-inner.apexcharts-graphical'
        );
        if (apexInner) {
          apexInner.setAttribute('transform', 'translate(180, 20)');
        }
        const yAxisLabels = clonedElement.querySelectorAll<SVGTextElement>(
          '.apexcharts-yaxis-label text, .apexcharts-yaxis text'
        );
        yAxisLabels.forEach(label => {
          const currentX = parseFloat(label.getAttribute('x') ?? '0');
          label.setAttribute('x', String(currentX - 60));
        });

        const printButton = clonedElement.querySelector('#print-button');
        printButton?.remove();
      },

      list: el => {
        el.querySelectorAll('#isSelectedHeader,#isSelectedCheckbox').forEach(
          cell => cell.remove()
        );
        el.querySelectorAll(
          '.action-column-header,.action-column-cell'
        ).forEach(cell => cell.remove());
        el.querySelector('mat-paginator')?.remove();
      },
    };

    if (processes[key]) processes[key](clonedElement);
  }

  printReportInfo(mainContainer: ElementRef, preProcess?: string): HTMLElement {
    const source = mainContainer.nativeElement as HTMLElement;
    const cloned = source.cloneNode(true) as HTMLElement;

    if (preProcess) this.preProcessHTML(cloned, preProcess);

    cloned.querySelector('#swiper-container')?.removeAttribute('effect');
    cloned
      .querySelectorAll('h2')
      .forEach(h => (h.style.fontSize = STYLE_CONF.font_size.h2));
    cloned
      .querySelectorAll('h3')
      .forEach(h => (h.style.fontSize = STYLE_CONF.font_size.h3));
    cloned
      .querySelectorAll('h4')
      .forEach(h => (h.style.fontSize = STYLE_CONF.font_size.h4));
    cloned
      .querySelectorAll('p')
      .forEach(p => (p.style.fontSize = STYLE_CONF.font_size.p));

    cloned.querySelector('#print-button')?.remove();
    cloned.querySelector('.form-container')?.remove();
    cloned.querySelector('.filter-container')?.remove();
    cloned.querySelector('.title-card')?.remove();
    cloned.querySelectorAll('.apexcharts-tooltip').forEach(t => t.remove());
    cloned.querySelectorAll('mat-card-actions').forEach(a => a.remove());

    // Extract ApexCharts title text and legend, remove them from SVG,
    // inject them as real HTML above the chart so they don't overlap on resize
    cloned
      .querySelectorAll<HTMLElement>('.apexcharts-canvas')
      .forEach(canvas => {
        const svgTitle = canvas.querySelector<SVGTextElement>(
          '.apexcharts-title-text'
        );
        const titleText = svgTitle?.textContent?.trim();

        // Hide only the SVG-rendered title — it overlaps when SVG is resized
        canvas
          .querySelectorAll<SVGElement>('.apexcharts-title-text')
          .forEach(el => (el.style.display = 'none'));

        // The legend is a real HTML div inside .apexcharts-canvas, not inside the SVG
        // Move it AFTER the title div but BEFORE the SVG so it renders in flow
        const legend = canvas.querySelector<HTMLElement>('.apexcharts-legend');

        if (canvas.parentElement) {
          // Inject HTML title above the chart
          if (titleText) {
            const titleEl = document.createElement('div');
            titleEl.textContent = titleText;
            Object.assign(titleEl.style, {
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '4px',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            });
            canvas.parentElement.insertBefore(titleEl, canvas);
          }

          // Move legend out of the canvas and into normal HTML flow
          if (legend) {
            const legendClone = legend.cloneNode(true) as HTMLElement;
            Object.assign(legendClone.style, {
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              margin: '6px 0 8px 0',
              justifyContent: 'center',
              position: 'static', // override ApexCharts absolute positioning
              top: 'auto',
              left: 'auto',
            });
            // Also fix individual legend markers in case they use absolute pos
            legendClone
              .querySelectorAll<HTMLElement>('.apexcharts-legend-series')
              .forEach(series => {
                series.style.position = 'relative';
                series.style.display = 'flex';
                series.style.alignItems = 'center';
              });
            canvas.parentElement.insertBefore(legendClone, canvas);
            legend.style.display = 'none'; // hide original
          }
        }
      });

    const containerCardList = cloned.querySelector(
      '.container-card-list'
    ) as HTMLElement;
    if (containerCardList) {
      Object.assign(containerCardList.style, STYLE_CONF.container_card);
    }

    const chartContainer = cloned.querySelector(
      '.chart-container'
    ) as HTMLElement;
    if (chartContainer) {
      Object.assign(chartContainer.style, {
        ...STYLE_CONF.container_card,
        width: '100%',
        maxWidth: 'none',
        overflow: 'visible',
        whiteSpace: 'normal',
        margin: '0 auto',
      });
    }

    return cloned;
  }

  async exportToPdf(args: ExportArgs) {
    if (args.snackBar) {
      args.snackBar.open(SNACKBAR_CONF.message_start, 'Close', {
        duration: SNACKBAR_CONF.duration,
        panelClass: SNACKBAR_CONF.panel_class,
      });
    }

    const fileName = generateFileName(args.fileName ?? DEFAULT_VALUES.fileName);
    const cloned = this.printReportInfo(args.container, args.preProcess);

    const { width, height } = await this.measureAndPrepare(cloned);

    return this.pdfService.exportToPDF(
      cloned,
      fileName,
      width,
      height,
      0,
      () => {
        if (document.body.contains(cloned)) document.body.removeChild(cloned);
        if (args.snackBar) {
          args.snackBar.open(SNACKBAR_CONF.message_end, 'OK', {
            duration: SNACKBAR_CONF.duration,
            panelClass: SNACKBAR_CONF.panel_class,
          });
        }
      }
    );
  }

  async exportCardToPdf(args: ExportArgs) {
    const element = args.container?.nativeElement as HTMLElement;
    const fileName = generateFileName(args.fileName ?? DEFAULT_VALUES.fileName);
    const clonedElement = this.printReportInfo(args.container, args.preProcess);

    const cloned = element.cloneNode(true) as HTMLElement;

    const collapsibleContent = cloned.querySelector<HTMLElement>(
      '.card, .card-body, [class*="content"]'
    );
    if (collapsibleContent) {
      Object.assign(collapsibleContent.style, {
        display: 'block',
        overflow: 'visible',
        maxHeight: 'none',
        height: 'auto',
        visibility: 'visible',
        opacity: '1',
      });
    }

    cloned
      .querySelectorAll<HTMLElement>(
        '.pdf-export, .expand-toggle, .change-to-column, .card-actions, [class*="export"], [class*="toggle"]'
      )
      .forEach(el => (el.style.display = 'none'));

    const { width, height } = await this.measureAndPrepare(
      cloned,
      element.offsetWidth
    );

    return this.pdfService.exportToPDF(
      clonedElement,
      fileName,
      width,
      height,
      0,
      () => {
        if (document.body.contains(cloned)) document.body.removeChild(cloned);
      },
      args.title
    );
  }
}
