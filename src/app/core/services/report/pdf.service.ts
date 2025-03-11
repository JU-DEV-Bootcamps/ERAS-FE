import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { PDF_CONFIG } from '../../constants/pdf';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  exportToPDF(element: HTMLElement, name: string, callback?: () => void) {
    html2canvas(element, { scale: 2, useCORS: true })
      .then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'a4');

        const marginTop = PDF_CONFIG.margin.top;
        const marginLeft = PDF_CONFIG.margin.left;
        const marginRight = PDF_CONFIG.margin.right;
        const marginBottom = PDF_CONFIG.margin.bottom;

        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;

        const imgWidth = pageWidth - marginLeft - marginRight;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const usableHeight = pageHeight - marginTop - marginBottom;
        const overlapHeight = 10;

        const yPosition = marginTop;
        let currentHeight = 0;
        let isLastPage = false;

        while (currentHeight < imgHeight) {
          if (currentHeight > 0) pdf.addPage();

          if (imgHeight - currentHeight <= usableHeight) {
            isLastPage = true;
          }

          const sectionStart = currentHeight * (canvas.width / imgWidth);
          const sectionHeight = isLastPage
            ? (imgHeight - currentHeight) * (canvas.width / imgWidth)
            : (usableHeight + overlapHeight) * (canvas.width / imgWidth);

          const section = canvas
            .getContext('2d')!
            .getImageData(
              0,
              Math.max(0, sectionStart),
              canvas.width,
              Math.min(canvas.height - sectionStart, sectionHeight)
            );

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = section.height;
          tempCanvas.getContext('2d')!.putImageData(section, 0, 0);

          const fragmentImgData = tempCanvas.toDataURL('image/jpeg');

          const finalHeight = isLastPage
            ? imgHeight - currentHeight
            : usableHeight + overlapHeight;

          pdf.addImage(
            fragmentImgData,
            'JPEG',
            marginLeft,
            yPosition,
            imgWidth,
            finalHeight
          );

          currentHeight += isLastPage
            ? imgHeight - currentHeight
            : usableHeight;
        }

        pdf.save(`${name}.pdf`);
      })
      .catch(error => {
        console.error('Error al generar el PDF:', error);
      })
      .finally(() => {
        callback?.();
      });
  }
}
