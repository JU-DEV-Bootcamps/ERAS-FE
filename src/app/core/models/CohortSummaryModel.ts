import { UUID } from 'crypto';

export interface CohortSummaryModel {
  studentUuid: UUID;
  studentName: string;
  cohortId: number;
  cohortName: string;
  pollinstancesAverage: number;
  pollinstancesCount: number;
}
