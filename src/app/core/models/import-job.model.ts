import { SelectableModel } from './common/selectable.model';

export type ImportJobStatus =
  | 'Queued'
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'PartiallyCompleted';

export interface ImportJobStatusModel {
  importJobId: number;
  evaluationId: number;
  status: ImportJobStatus;
  totalCount: number;
  processedCount: number;
  retryCount: number;
  errorMessage?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ImportJobItem {
  id: number;
  importJobId: number;
  studentEmail: string;
  studentName: string;
  cohort?: string | null;
  status: ImportJobStatus;
  retryCount: number;
  errorMessage?: string | null;
}

/** Row model for the tracking grid; `isSelected` enables multi-select retry. */
export interface ImportItemRow extends SelectableModel {
  id: number;
  name: string;
  email: string;
  cohort: string;
  status: ImportJobStatus;
  retryCount: number;
  errorMessage?: string | null;
}

export interface QueuedImportResponse {
  importJobId: number;
  status: string;
}

export const IMPORT_TERMINAL_STATUSES: ImportJobStatus[] = [
  'Completed',
  'Failed',
  'PartiallyCompleted',
];
