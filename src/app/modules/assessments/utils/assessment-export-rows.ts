import { formatDate, TitleCasePipe } from '@angular/common';
import { AssessmentRowViewModel } from '../components/assessment-list/assessment-list.component';
import { ASSESSMENT_EXPORT_COLUMNS } from '../models/assessment-export.columns';
import { ASSESSMENT_STATUS_LABELS } from '../models/assessment-status-labels';

const titleCase = new TitleCasePipe();

const mapRow = (row: AssessmentRowViewModel): string[] => {
  const values: Record<
    (typeof ASSESSMENT_EXPORT_COLUMNS)[number]['key'],
    string
  > = {
    date: formatDate(row.createdAtUtc, 'MM/dd/yyyy', 'en-US'),
    submitter: row.submitterDisplay,
    service: titleCase.transform(row.service),
    professional: row.professionalDisplay,
    student: (row.students ?? []).map(student => student.name).join(', '),
    status: ASSESSMENT_STATUS_LABELS[row.status] ?? row.status,
    comment: row.comments?.trim() ? row.comments : '—',
  };
  return ASSESSMENT_EXPORT_COLUMNS.map(column => values[column.key]);
};

/** Plain strings in column order, in the same order as the given rows. */
export const buildAssessmentExportRows = (
  rows: AssessmentRowViewModel[]
): string[][] => rows.map(mapRow);
