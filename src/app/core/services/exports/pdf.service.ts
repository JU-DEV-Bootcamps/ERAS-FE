import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { PDF_CONFIG } from '../../constants/pdf';
import { BaseExportService } from './base-export.service';

@Injectable({
  providedIn: 'root',
})
export class PdfService extends BaseExportService {
  protected extension = 'pdf';

  exportToPDF(element: HTMLElement, name: string, callback?: () => void) {
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      removeContainer: true,
    })
      .then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'letter');

        const marginTop = PDF_CONFIG.margin.top;
        const marginLeft = PDF_CONFIG.margin.left;
        const marginRight = PDF_CONFIG.margin.right;
        const marginBottom = PDF_CONFIG.margin.bottom;

        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;

        const imgWidth = pageWidth - marginLeft - marginRight;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const usableHeight = pageHeight - marginTop - marginBottom;

        let currentHeight = 0;

        while (currentHeight < imgHeight) {
          if (currentHeight > 0) pdf.addPage();

          const sectionHeight = Math.min(
            usableHeight,
            imgHeight - currentHeight
          );
          const section = canvas
            .getContext('2d')!
            .getImageData(
              0,
              currentHeight * (canvas.height / imgHeight),
              canvas.width,
              sectionHeight * (canvas.height / imgHeight)
            );

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = section.height;
          tempCanvas.getContext('2d')!.putImageData(section, 0, 0);

          const fragmentImgData = tempCanvas.toDataURL('image/jpeg');

          pdf.addImage(
            fragmentImgData,
            'JPEG',
            marginLeft,
            marginTop,
            imgWidth,
            sectionHeight
          );

          currentHeight += sectionHeight;
        }

        pdf.save(`${name}.${this.extension}`);
      })
      .catch(error => {
        console.error('Error while generating PDF:', error);
      })
      .finally(() => {
        callback?.();
      });
  }
}
