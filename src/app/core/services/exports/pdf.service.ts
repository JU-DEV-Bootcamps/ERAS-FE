import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { PDF_CONFIG } from '../../constants/pdf';
import { BaseExportService } from './base-export.service';

@Injectable({ providedIn: 'root' })
export class PdfService extends BaseExportService {
  protected extension = 'pdf';

  exportToPDF(
    element: HTMLElement,
    name: string,
    contentWidth: number,
    contentHeight: number,
    offsetX = 0,
    callback?: () => void,
    title?: string
  ) {
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      removeContainer: true,
      width: contentWidth,
      height: contentHeight,
      windowWidth: contentWidth,
      windowHeight: contentHeight,
      scrollX: -offsetX,
      scrollY: 0,
      x: 0,
      y: 0,
    })
      .then(canvas => {
        const isLandscape = canvas.width > canvas.height;
        const pdf = new jsPDF(isLandscape ? 'l' : 'p', 'mm', 'letter');

        const {
          top: marginTop,
          left: marginLeft,
          right: marginRight,
          bottom: marginBottom,
        } = PDF_CONFIG.margin;

        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const imgWidth = pageWidth - marginLeft - marginRight;
        const mmPerPx = imgWidth / canvas.width;
        const pxPerMm = canvas.width / imgWidth;

        let contentOffsetTop = marginTop;
        if (title) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');

          const colonIndex = title.lastIndexOf(':');
          const firstLine =
            colonIndex !== -1 ? title.substring(0, colonIndex + 1) : title;
          const rest =
            colonIndex !== -1 ? title.substring(colonIndex + 1).trim() : null;
          const lines: string[] = [firstLine];
          if (rest)
            lines.push(
              ...pdf.splitTextToSize(rest, pageWidth - marginLeft - marginRight)
            );

          const lineHeight = 5;
          lines.forEach((line, i) =>
            pdf.text(line, marginLeft, marginTop + i * lineHeight)
          );
          contentOffsetTop = marginTop + lines.length * lineHeight + 3;
        }

        const usableHeightPage1 = pageHeight - contentOffsetTop - marginBottom;
        const usableHeightFullPage = pageHeight - marginTop - marginBottom;

        let srcYpx = 0;
        let isFirstPage = true;

        while (srcYpx < canvas.height - 1) {
          if (!isFirstPage) pdf.addPage();

          const offsetTop = isFirstPage ? contentOffsetTop : marginTop;
          const usableMm = isFirstPage
            ? usableHeightPage1
            : usableHeightFullPage;
          const slicePx = Math.min(
            Math.round(usableMm * pxPerMm),
            canvas.height - srcYpx
          );

          if (slicePx <= 0) break;

          const tmp = document.createElement('canvas');
          tmp.width = canvas.width;
          tmp.height = slicePx;
          tmp
            .getContext('2d')!
            .drawImage(
              canvas,
              0,
              srcYpx,
              canvas.width,
              slicePx,
              0,
              0,
              canvas.width,
              slicePx
            );

          pdf.addImage(
            tmp.toDataURL('image/jpeg', 0.92),
            'JPEG',
            marginLeft,
            offsetTop,
            imgWidth,
            slicePx * mmPerPx
          );

          srcYpx += slicePx;
          isFirstPage = false;
        }

        pdf.save(`${name}.${this.extension}`);
      })
      .catch(err => console.error('Error generating PDF:', err))
      .finally(() => callback?.());
  }
}
