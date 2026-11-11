import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';

export interface TablePdfOptions {
  title: string;
  exportedAt: string;
  exportedBy: string;
  filtersText: string;
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
    doc.text(`Exported: ${options.exportedAt}`, margin, 23);
    doc.text(`Exported by: ${options.exportedBy}`, margin, 28);
    doc.text(`Filters: ${options.filtersText}`, margin, 33);

    autoTable(doc, {
      startY: 38,
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
