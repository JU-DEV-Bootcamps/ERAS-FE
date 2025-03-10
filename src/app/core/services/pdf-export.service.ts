import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

@Injectable({
  providedIn: 'root',
})
export class PdfExportService {
  generatePDF(element: HTMLElement, fileName = 'document.pdf') {
    return new Promise<void>((resolve, reject) => {
      html2canvas(element, { scale: 2, useCORS: true })
        .then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'letter');
          const marginTop = 20;
          const marginLeft = 15;
          const marginRight = 15;

          const pageWidth = pdf.internal.pageSize.width;

          const imgWidth = pageWidth - marginLeft - marginRight;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(
            imgData,
            'PNG',
            marginLeft,
            marginTop,
            imgWidth,
            imgHeight
          );
          pdf.save(fileName);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}
