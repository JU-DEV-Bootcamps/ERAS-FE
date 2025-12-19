import { inject, Injectable } from '@angular/core';
import { CSV_CONFIG } from '../../constants/csv';
import Papa, { UnparseObject } from 'papaparse';
import { BaseExportService } from './base-export.service';
import { BreadcrumbsService } from '../breadcrumbs.service';
import { generateFileName } from '../../utils/file/file-name';

@Injectable({
  providedIn: 'root',
})
export class CsvService extends BaseExportService {
  protected extension = 'csv';
  readonly breadcrumbsService = inject(BreadcrumbsService);

  exportToCSV(data: object[], columns: string[], fields?: string[]) {
    const unparsedObject: { data: object[]; fields?: string[] } = { data };

    let parsedObject = Papa.unparse(unparsedObject as UnparseObject<object>, {
      ...CSV_CONFIG,
      columns,
    });

    if (fields) {
      const headers = fields.join(',');
      const regex = new RegExp(`^(.*?)${CSV_CONFIG.newline}`);

      parsedObject = parsedObject.replace(regex, headers + CSV_CONFIG.newline);
    }

    super.downloadTextFile(parsedObject, generateFileName());
  }
}
