import { inject, Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { CSV_CONFIG } from '@core/constants/csv';
import { UserDataService } from '@core/services/access/user-data.service';
import { BaseExportService } from '@core/services/exports/base-export.service';
import { TablePdfService } from '@core/services/exports/table-pdf.service';
import { FileNameUtils } from '@core/utils/file/file-name';
import { AssessmentRowViewModel } from '../components/assessment-list/assessment-list.component';
import { ASSESSMENT_EXPORT_COLUMNS } from '../models/assessment-export.columns';
import { buildAssessmentExportRows } from '../utils/assessment-export-rows';

const UTF8_BOM = '﻿';
const FILE_PREFIX = 'assessments';

@Injectable({
  providedIn: 'root',
})
export class AssessmentExportService extends BaseExportService {
  protected extension = 'csv';

  private readonly tablePdf = inject(TablePdfService);
  private readonly userData = inject(UserDataService);

  exportCsv(rows: AssessmentRowViewModel[]): void {
    const csv = Papa.unparse(
      {
        fields: ASSESSMENT_EXPORT_COLUMNS.map(column => column.label),
        data: buildAssessmentExportRows(rows),
      },
      // escapeFormulae also prefixes cells that start with tab or carriage return.
      { ...CSV_CONFIG, columns: undefined, escapeFormulae: true }
    );

    this.downloadTextFile(
      UTF8_BOM + csv,
      FileNameUtils.generateFileName(FILE_PREFIX)
    );
  }

  async buildPdf(rows: AssessmentRowViewModel[]): Promise<jsPDF> {
    const user = this.userData.user();
    return this.tablePdf.buildDocument({
      title: 'Assessments',
      exportedAt: new Date().toLocaleString(),
      exportedBy: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
      filtersText: 'None',
      columns: ASSESSMENT_EXPORT_COLUMNS.map(column => column.label),
      rows: buildAssessmentExportRows(rows),
    });
  }

  async exportPdf(rows: AssessmentRowViewModel[]): Promise<void> {
    const doc = await this.buildPdf(rows);
    this.tablePdf.download(doc, FileNameUtils.generateFileName(FILE_PREFIX));
  }
}
