import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseExportService {
  protected abstract extension: string;

  downloadTextFile(text: string, fileName: string) {
    const blob = new Blob(['', text], { type: 'text/csv; charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `${fileName}.${this.extension}`;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
