import { ElementRef, inject, Injectable } from '@angular/core';
import { generateFileName } from '@core/utils/file/file-name';
import { PdfService } from '@core/services/exports/pdf.service';
import { ExportArgs } from '../../../modules/reports/components/summary-charts/types/export';
import {
  DEFAULT_VALUES,
  SNACKBAR_CONF,
  STYLE_CONF,
} from '../../../modules/reports/components/summary-charts/constants/export-conf';

@Injectable({ providedIn: 'root' })
export class PdfHelper {
  pdfService = inject(PdfService);

  preProcessHTML(clonedElement: HTMLElement, key: string) {
    const processes: Record<string, (clonedElement: HTMLElement) => void> = {
      'student-detail': (clonedElement: HTMLElement) => {
        clonedElement
          .querySelector('#chart-student-detail')
          ?.classList.add('print-chart');

        const swiperContainer =
          clonedElement.querySelector('#swiper-container');
        if (swiperContainer) {
          swiperContainer.removeAttribute('effect');
        }

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

        const printButton = clonedElement.querySelector('#print-button');
        printButton?.remove();
      },
      list: (clonedElement: HTMLElement) => {
        const actionColumnCells = clonedElement.querySelectorAll(
          '.action-column-header,.action-column-cell'
        );
        actionColumnCells.forEach(cell => {
          cell.remove();
        });

        const paginator = clonedElement.querySelector('mat-paginator');
        paginator?.remove();
      },
    };

    if (processes[key]) {
      processes[key](clonedElement);
    }
  }

  printReportInfo(mainContainer: ElementRef, preProcess?: string): HTMLElement {
    const mainContainerElement = mainContainer.nativeElement;
    const clonedElement = mainContainerElement.cloneNode(true) as HTMLElement;
    clonedElement.style.width = STYLE_CONF.width;
    clonedElement.style.margin = STYLE_CONF.margin;

    if (preProcess) {
      this.preProcessHTML(clonedElement, preProcess);
    }

    const swiperContainer = clonedElement.querySelector('#swiper-container');
    if (swiperContainer) {
      swiperContainer.removeAttribute('effect');
    }

    clonedElement.style.fontSize = STYLE_CONF.font_size.h4;

    const h2Elements = clonedElement.querySelectorAll('h2');
    h2Elements.forEach(h2 => (h2.style.fontSize = STYLE_CONF.font_size.h2));

    const h3Elements = clonedElement.querySelectorAll('h3');
    h3Elements.forEach(h3 => (h3.style.fontSize = STYLE_CONF.font_size.h3));

    const h4Elements = clonedElement.querySelectorAll('h4');
    h4Elements.forEach(h4 => (h4.style.fontSize = STYLE_CONF.font_size.h4));

    const pElements = clonedElement.querySelectorAll('p');
    pElements.forEach(p => (p.style.fontSize = STYLE_CONF.font_size.p));

    clonedElement.querySelector('#print-button')?.remove();
    clonedElement.querySelector('.form-container')?.remove();
    clonedElement.querySelector('.filter-container')?.remove();
    clonedElement.querySelector('.title-card')?.remove();
    clonedElement.querySelectorAll('.apexcharts-tooltip').forEach(tooltip => {
      tooltip.remove();
    });

    // Mobile
    clonedElement.querySelectorAll('mat-card-actions').forEach(matCard => {
      matCard.remove();
    });

    const containerCardList = clonedElement.querySelector(
      '.container-card-list'
    ) as HTMLElement;
    if (containerCardList) {
      Object.assign(containerCardList.style, STYLE_CONF.container_card);
    }

    const chartContainer = clonedElement.querySelector(
      '.chart-container'
    ) as HTMLElement;
    if (chartContainer) {
      Object.assign(chartContainer.style, {
        ...STYLE_CONF.container_card,
        margin: '0 auto',
        maxWidth: 'none',
      });
    }

    return clonedElement;
  }

  async exportToPdf(args: ExportArgs) {
    if (args.snackBar) {
      args.snackBar.open(SNACKBAR_CONF.message_start, 'Close', {
        duration: SNACKBAR_CONF.duration,
        panelClass: SNACKBAR_CONF.panel_class,
      });
    }

    const fileName = generateFileName(args.fileName ?? DEFAULT_VALUES.fileName);
    const clonedElement = this.printReportInfo(args.container, args.preProcess);

    document.body.appendChild(clonedElement);
    return this.pdfService.exportToPDF(clonedElement, fileName, () => {
      document.body.removeChild(clonedElement);
      if (args.snackBar) {
        args.snackBar.open(SNACKBAR_CONF.message_end, 'OK', {
          duration: SNACKBAR_CONF.duration,
          panelClass: SNACKBAR_CONF.panel_class,
        });
      }
    });
  }
}
