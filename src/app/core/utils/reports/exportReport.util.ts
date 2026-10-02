import { inject, Injectable } from '@angular/core';
import { FileNameUtils } from '@core/utils/file/file-name';
import { PdfService } from '@core/services/exports/pdf.service';
import {
  DEFAULT_VALUES,
  SNACKBAR_CONF,
  STYLE_CONF,
} from '../../../modules/reports/components/summary-charts/constants/export-conf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { PDF_CONFIG } from '@core/constants/pdf';
import {
  ExportArgs,
  ExportArgsChunked,
  LETTER_PX,
} from '@modules/reports/components/summary-charts/types/export';

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

        const infoValues =
          clonedElement.querySelectorAll<HTMLElement>('.info-value');
        infoValues.forEach(val => {
          val.style.whiteSpace = 'normal';
          val.style.overflow = 'visible';
          val.style.textOverflow = 'clip';
          val.style.height = 'auto';
          val.style.wordBreak = 'break-all';
        });

        const infoFields =
          clonedElement.querySelectorAll<HTMLElement>('.info-field');
        infoFields.forEach(field => {
          field.style.minWidth = 'auto';
          field.style.height = 'auto';
        });

        const infoFieldsRow =
          clonedElement.querySelector<HTMLElement>('.info-fields-row');
        if (infoFieldsRow) {
          infoFieldsRow.style.height = 'auto';
          infoFieldsRow.style.alignItems = 'flex-start';
        }

        const studentInfoGrid =
          clonedElement.querySelector<HTMLElement>('.student-info-grid');
        if (studentInfoGrid) {
          studentInfoGrid.style.height = 'auto';
          studentInfoGrid.style.minHeight = '96px';
        }

        const cardPerformance = clonedElement.querySelector(
          '.card-performance'
        ) as HTMLElement;
        const cardRisk = clonedElement.querySelector(
          '.card-risk'
        ) as HTMLElement;

        if (cardPerformance) {
          cardPerformance.style.width = '30%';
          cardPerformance.style.flex = '1';

          const cardTitle =
            cardPerformance.querySelector<HTMLElement>('.card-title');
          if (cardTitle) cardTitle.style.fontSize = '13px';

          const metricLabels =
            cardPerformance.querySelectorAll<HTMLElement>('.metric-label');
          metricLabels.forEach(el => (el.style.fontSize = '11px'));

          const metricValues =
            cardPerformance.querySelectorAll<HTMLElement>('.metric-value');
          metricValues.forEach(el => (el.style.fontSize = '12px'));
        }

        if (cardRisk) {
          cardRisk.style.width = '70%';
          cardRisk.style.flex = '1';
          cardRisk.style.overflow = 'visible';

          const cardTitle = cardRisk.querySelector<HTMLElement>('.card-title');
          if (cardTitle) cardTitle.style.fontSize = '12px';

          const riskChartCanvas =
            cardRisk.querySelector<HTMLElement>('.apexcharts-canvas');
          if (riskChartCanvas) {
            riskChartCanvas.style.overflow = 'visible';
            const svg = riskChartCanvas.querySelector<SVGElement>('svg');
            if (svg) {
              const svgW = parseFloat(svg.getAttribute('width') ?? '0');
              const svgH = parseFloat(svg.getAttribute('height') ?? '0');

              if (svgW > 0 && svgH > 0) {
                const LABEL_PADDING_PX = 190;
                svg
                  .querySelectorAll<SVGClipPathElement>('clipPath')
                  .forEach(cp => {
                    const rect = cp.querySelector('rect');
                    if (rect) {
                      const w = parseFloat(rect.getAttribute('width') ?? '0');
                      if (w > 0)
                        rect.setAttribute(
                          'width',
                          String(w + LABEL_PADDING_PX)
                        );
                    }
                  });

                svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
                svg.setAttribute('width', String(Math.round(svgW * 0.98)));
                svg.setAttribute('height', String(Math.round(svgH * 0.7)));
              }
              svg.style.overflow = 'visible';
              svg.style.transformOrigin = '0% 10%';
            }
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
          label.style.fontSize = '0.6em';
        });

        const allButtons = clonedElement.querySelectorAll('button');
        allButtons.forEach(button => button.remove());

        const printLink = clonedElement.querySelector('#print-button');
        printLink?.remove();

        clonedElement.querySelector('mat-paginator')?.remove();
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

  printReportInfo(source: HTMLElement, preProcess?: string): HTMLElement {
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
            legend.style.display = 'none';
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

  async exportToPdfChunked(args: ExportArgsChunked): Promise<void> {
    if (args.snackBar) {
      args.snackBar.open('Starting PDF export...', 'Close', {
        duration: 3000,
        panelClass: ['high-z-snackbar', 'snackbar-info'],
      });
    }

    const fileName = FileNameUtils.generateFileName(
      args.fileName ?? DEFAULT_VALUES.fileName
    );
    const totalItems = args.totalChunks;
    const chunks = totalItems;

    const pdf = new jsPDF('p', 'mm', 'letter');
    let isFirstPage = true;

    for (let i = 0; i < chunks; i++) {
      const element = await args.getChunkElement(i, chunks);
      const { width, height } = await this.measureAndPrepare(element);

      const canvases = await this.renderChunkToCanvases(element, width, height);

      for (const canvas of canvases) {
        if (!isFirstPage) pdf.addPage();
        this.addCanvasToPage(pdf, canvas, isFirstPage ? args.title : undefined);
        isFirstPage = false;
      }
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }

      const progress = Math.round(((i + 1) / chunks) * 100);
      if (args.snackBar) {
        args.snackBar.dismiss();
        args.snackBar.open(`Exporting: ${progress}%`, 'Close', {
          duration: 2000,
          panelClass: ['high-z-snackbar', 'snackbar-info'],
        });
      }
      await args.onChunkDone?.(i, chunks);
    }

    pdf.save(`${fileName}.pdf`);
    args.callback?.();
  }

  private async renderChunkToCanvases(
    element: HTMLElement,
    width: number,
    height: number
  ): Promise<HTMLCanvasElement[]> {
    const scale = 2;
    const canvases: HTMLCanvasElement[] = [];
    try {
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        logging: false,
        removeContainer: true,
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      });

      const pageHeightPx = scale * 792;
      if (canvas.height > pageHeightPx * 1.5) {
        const numPages = Math.ceil(canvas.height / pageHeightPx);
        for (let i = 0; i < numPages; i++) {
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(
            pageHeightPx,
            canvas.height - i * pageHeightPx
          );
          pageCanvas
            .getContext('2d')!
            .drawImage(
              canvas,
              0,
              i * pageHeightPx,
              canvas.width,
              pageCanvas.height,
              0,
              0,
              canvas.width,
              pageCanvas.height
            );
          canvases.push(pageCanvas);
        }
      } else {
        canvases.push(canvas);
      }
    } catch (err) {
      console.error('Error rendering chunk to canvas:', err);
      throw err;
    }
    return canvases;
  }

  private addCanvasToPage(
    pdf: jsPDF,
    canvas: HTMLCanvasElement,
    title?: string
  ): void {
    const {
      top: marginTop,
      left: marginLeft,
      right: marginRight,
    } = PDF_CONFIG.margin;

    const pageWidth = pdf.internal.pageSize.width;
    const imgWidth = pageWidth - marginLeft - marginRight;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let yPosition = marginTop;

    if (title) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const lines = pdf.splitTextToSize(
        title,
        pageWidth - marginLeft - marginRight
      );
      yPosition += lines.length * 5 + 5;
    }
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', marginLeft, yPosition, imgWidth, imgHeight);
  }

  async exportToPdf(args: ExportArgs): Promise<void> {
    if (args.snackBar) {
      args.snackBar.open(SNACKBAR_CONF.message_start, 'Close', {
        duration: SNACKBAR_CONF.duration,
        panelClass: SNACKBAR_CONF.panel_class,
      });
    }

    const fileName = FileNameUtils.generateFileName(
      args.fileName ?? DEFAULT_VALUES.fileName
    );
    const processed = this.printReportInfo(
      args.container.nativeElement,
      args.preProcess
    );
    const { width, height } = await this.measureAndPrepare(processed);
    return this.pdfService.exportToPDF(
      processed,
      fileName,
      width,
      height,
      0,
      () => {
        if (document.body.contains(processed)) {
          document.body.removeChild(processed);
        }
        if (args.snackBar) {
          args.snackBar.open(SNACKBAR_CONF.message_end, 'OK', {
            duration: SNACKBAR_CONF.duration,
            panelClass: SNACKBAR_CONF.panel_class,
          });
        }
      },
      args.title
    );
  }

  async exportCardToPdf(args: ExportArgs): Promise<void> {
    const element = args.container?.nativeElement as HTMLElement;
    const fileName = FileNameUtils.generateFileName(
      args.fileName ?? DEFAULT_VALUES.fileName
    );

    const cloned = this.printReportInfo(
      args.container.nativeElement,
      args.preProcess
    );
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
        if (document.body.contains(cloned)) {
          document.body.removeChild(cloned);
        }
      },
      args.title
    );
  }
}
