import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';

export interface TablePdfOptions {
  title: string;
  /** Lines printed under the title, already worded by the caller. */
  headerLines: string[];
  /** Print the text up to the first colon of each header line in bold. */
  boldHeaderLabels?: boolean;
  columns: string[];
  rows: string[][];
}

@Injectable({
  providedIn: 'root',
})
export class TablePdfService {
  /** Builds a vector PDF (real text, headers repeated on every page). */
  async buildDocument(options: TablePdfOptions): Promise<jsPDF> {
    const [{ jsPDF: JsPdf }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const doc = new JsPdf({ orientation: 'landscape', format: 'a4' });
    const margin = 14;

    doc.setFontSize(16);
    doc.text(options.title, margin, 16);
    doc.setFontSize(10);
    options.headerLines.forEach((line, index) => {
      const y = 23 + index * 5;
      const separator = options.boldHeaderLabels ? line.indexOf(':') : -1;
      if (separator < 0) {
        doc.text(line, margin, y);
        return;
      }
      const label = line.slice(0, separator + 1);
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setFont('helvetica', 'normal');
      doc.text(line.slice(separator + 1), margin + labelWidth, y);
    });

    autoTable(doc, {
      startY: 23 + options.headerLines.length * 5 + 2,
      head: [options.columns],
      body: options.rows,
      showHead: 'everyPage',
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [60, 60, 60] },
    });

    return doc;
  }

  download(doc: jsPDF, fileName: string): void {
    doc.save(`${fileName}.pdf`);
  }
}
