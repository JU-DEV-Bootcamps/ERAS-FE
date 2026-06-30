import { SelectableModel } from './common/selectable.model';

export type ImportJobStatus =
  | 'Queued'
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'PartiallyCompleted'
  | 'Extracting'
  | 'Extracted'
  | 'Ready'
  | 'Importing'
  | 'Skipped';

export interface ImportJobStatusModel {
  importJobId: number;
  evaluationId: number;
  status: ImportJobStatus;
  totalCount: number;
  processedCount: number;
  extractedCount: number;
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
  isAlreadyImported: boolean;
  errorMessage?: string | null;
}

/** Row model for the unified import grid; `isSelected` drives confirm/retry selection. */
export interface ImportItemRow extends SelectableModel {
  id: number;
  name: string;
  email: string;
  cohort: string;
  status: ImportJobStatus;
  retryCount: number;
  isAlreadyImported: boolean;
  errorMessage?: string | null;
}

export interface QueuedImportResponse {
  importJobId: number;
  status: string;
}

export interface StartExtractionRequest {
  evaluationSetName: string;
  configurationId: number;
  startDate?: string | null;
  endDate?: string | null;
  evaluationId: number;
}

/** Phases where the backend is actively working and the client should keep polling. */
export const IMPORT_ACTIVE_STATUSES: ImportJobStatus[] = ['Extracting', 'Importing'];

export const IMPORT_TERMINAL_STATUSES: ImportJobStatus[] = [
  'Completed',
  'Failed',
  'PartiallyCompleted',
];
