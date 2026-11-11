export interface AssessmentExportColumn {
  key:
    | 'date'
    | 'submitter'
    | 'service'
    | 'professional'
    | 'student'
    | 'status'
    | 'comment';
  label: string;
}

/** Single source for the order and labels of the table and of both exports. */
export const ASSESSMENT_EXPORT_COLUMNS: readonly AssessmentExportColumn[] = [
  { key: 'date', label: 'Date' },
  { key: 'submitter', label: 'Submitter' },
  { key: 'service', label: 'Service' },
  { key: 'professional', label: 'Professional' },
  { key: 'student', label: 'Student' },
  { key: 'status', label: 'Status' },
  { key: 'comment', label: 'Comment' },
];
