import { formatDate } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import {
  AssessmentModel,
  AssessmentStatus,
} from '@core/models/assessment.model';
import { INTERVENTION_EXPORT_MESSAGES } from '@core/constants/messages';
import { UserDataService } from '@core/services/access/user-data.service';
import { TablePdfService } from '@core/services/exports/table-pdf.service';
import { FileNameUtils } from '@core/utils/file/file-name';
import {
  AppliedFilter,
  FilterName,
} from '@shared/components/list-filters/models/list-filters.interface';
import type { InterventionRowViewModel } from '../components/interventions/interventions-list/intervention-list.component';
import { INTERVENTION_EXPORT_COLUMNS } from '../models/intervention-export.columns';
import { ASSESSMENT_STATUS_LABELS } from '../models/assessment-status-labels';
import { buildInterventionExportRows } from '../utils/intervention-export-rows';

const FILE_PREFIX = 'interventions';

const FILTER_LABELS: Record<FilterName, string> = {
  [FilterName.Assessment]: 'Assessment',
  [FilterName.Type]: 'Type',
  [FilterName.Status]: 'Status',
  [FilterName.Risk]: 'Risk Level',
};

@Injectable({
  providedIn: 'root',
})
export class InterventionExportService {
  private readonly tablePdf = inject(TablePdfService);
  private readonly userData = inject(UserDataService);

  async buildPdf(
    rows: InterventionRowViewModel[],
    filters: AppliedFilter[],
    assessment: AssessmentModel | null
  ): Promise<jsPDF> {
    const user = this.userData.user();
    const messages = INTERVENTION_EXPORT_MESSAGES;
    const exportedBy =
      `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    return this.tablePdf.buildDocument({
      title: messages.PDF_TITLE,
      headerLines: [
        `${messages.PDF_EXPORTED_AT} ${new Date().toLocaleString()}`,
        `${messages.PDF_EXPORTED_BY} ${exportedBy}`,
        ...this.buildFilterLines(filters, assessment),
      ],
      boldHeaderLabels: true,
      columns: INTERVENTION_EXPORT_COLUMNS.map(column => column.label),
      rows: buildInterventionExportRows(rows),
    });
  }

  async exportPdf(
    rows: InterventionRowViewModel[],
    filters: AppliedFilter[],
    assessment: AssessmentModel | null
  ): Promise<void> {
    const doc = await this.buildPdf(rows, filters, assessment);
    this.tablePdf.download(doc, FileNameUtils.generateFileName(FILE_PREFIX));
  }

  /** One line per filter that has a selection, in the order of the list. */
  private buildFilterLines(
    filters: AppliedFilter[],
    assessment: AssessmentModel | null
  ): string[] {
    const lines: string[] = [];
    for (const filter of filters) {
      const value = this.describeFilter(filter, assessment);
      if (value) lines.push(`${FILTER_LABELS[filter.name]}: ${value}`);
    }
    return lines.length
      ? [INTERVENTION_EXPORT_MESSAGES.PDF_FILTERS, ...lines]
      : [];
  }

  private describeFilter(
    filter: AppliedFilter,
    assessment: AssessmentModel | null
  ): string {
    if (filter.name === FilterName.Assessment) {
      return assessment ? this.describeAssessment(assessment) : '';
    }
    if (!Array.isArray(filter.value) || !filter.value.length) return '';
    const values =
      filter.name === FilterName.Status
        ? filter.value.map(
            status =>
              ASSESSMENT_STATUS_LABELS[status as AssessmentStatus] ?? status
          )
        : filter.value;
    return values.join(', ');
  }

  private describeAssessment(assessment: AssessmentModel): string {
    const date = formatDate(assessment.createdAtUtc, 'MM/dd/yyyy', 'en-US');
    const status =
      ASSESSMENT_STATUS_LABELS[assessment.status] ?? assessment.status;
    return `${date} – ${assessment.service} (${status})`;
  }
}
