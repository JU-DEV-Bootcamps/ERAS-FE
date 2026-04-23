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

  private waitForReflow(): Promise<void> {
    return new Promise(resolve =>
      requestAnimationFrame(() => setTimeout(resolve, 100))
    );
  }

  private async measureAndPrepare(
    cloned: HTMLElement,
    initialWidth?: number
  ): Promise<{ width: number; height: number }> {
    Object.assign(cloned.style, {
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: initialWidth ? `${initialWidth}px` : '100%',
      height: 'auto',
      overflow: 'visible',
      zIndex: '-9999',
      opacity: '0',
      pointerEvents: 'none',
    });

    document.body.appendChild(cloned);
    await this.waitForReflow();

    const naturalW = Math.ceil(cloned.getBoundingClientRect().width);
    const naturalH = Math.ceil(cloned.getBoundingClientRect().height);
    const isLandscape = naturalW > naturalH;
    const targetW = isLandscape ? LETTER_PX.landscape : LETTER_PX.portrait;

    cloned.style.width = `${targetW}px`;
    cloned.style.height = 'auto';
    await this.waitForReflow();

    cloned
      .querySelectorAll<HTMLElement>('.apexcharts-canvas')
      .forEach(canvas => {
        const containerW =
          canvas.parentElement?.getBoundingClientRect().width ?? targetW;

        canvas.style.width = `${containerW}px`;
        canvas.style.overflow = 'visible';

        const svg = canvas.querySelector<SVGElement>('svg');
        if (svg) {
          const viewBox = svg.getAttribute('viewBox');
          if (!viewBox) {
            const origW = parseFloat(
              svg.getAttribute('width') ?? String(containerW)
            );
            const origH = parseFloat(svg.getAttribute('height') ?? '400');
            svg.setAttribute('viewBox', `0 0 ${origW} ${origH}`);
          }
          svg.setAttribute('width', String(containerW));
          svg.style.width = `${containerW}px`;
          svg.style.overflow = 'visible';
        }
      });

    await this.waitForReflow();

    const finalH = Math.ceil(cloned.getBoundingClientRect().height);
    cloned.style.opacity = '1';

    return { width: targetW, height: finalH };
  }

  preProcessHTML(clonedElement: HTMLElement, key: string) {
    const processes: Record<string, (el: HTMLElement) => void> = {
      'student-detail': (clonedElement: HTMLElement) => {
        clonedElement.style.overflow = 'visible';

        const studentHeader = clonedElement.querySelector(
          '.student-header'
        ) as HTMLElement;
        if (studentHeader) {
          studentHeader.style.width = '96%';
          studentHeader.style.maxWidth = '96%';
          studentHeader.style.boxSizing = 'border-box';
          studentHeader.style.fontSize = '1em';
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

          const riskChartCanvas = cardRisk.querySelector(
            '.apexcharts-canvas'
          ) as HTMLElement;
          if (riskChartCanvas) {
            riskChartCanvas.style.transform = 'scale(0.8)';
            riskChartCanvas.style.transformOrigin = 'center center';
          }
        }

        clonedElement
          .querySelector('#chart-student-detail')
          ?.classList.add('print-chart');

        const h1 = document.createElement('h1');
        h1.textContent = 'Student Details';
        h1.style.textAlign = 'center';
        h1.style.fontSize = '2em';
        h1.style.fontWeight = '500';
        clonedElement.insertBefore(h1, clonedElement.firstChild);

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

        const allButtons = clonedElement.querySelectorAll('button');
        allButtons.forEach(button => button.remove());

        const printLink = clonedElement.querySelector('#print-button');
        printLink?.remove();
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

    cloned
      .querySelectorAll<HTMLElement>('.apexcharts-canvas')
      .forEach(canvas => {
        const svgTitle = canvas.querySelector<SVGTextElement>(
          '.apexcharts-title-text'
        );
        const titleText = svgTitle?.textContent?.trim();

        canvas
          .querySelectorAll<SVGElement>('.apexcharts-title-text')
          .forEach(el => (el.style.display = 'none'));

        const legend = canvas.querySelector<HTMLElement>('.apexcharts-legend');

        if (canvas.parentElement) {
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

          if (legend) {
            const legendClone = legend.cloneNode(true) as HTMLElement;
            Object.assign(legendClone.style, {
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              margin: '6px 0 8px 0',
              justifyContent: 'center',
              position: 'static',
              top: 'auto',
              left: 'auto',
            });
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
      cloned,
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
