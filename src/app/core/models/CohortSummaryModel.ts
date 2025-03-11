import { UUID } from 'crypto';

export interface CohortsSummaryModel {
  cohortCount: number;
  studentCount: number;
  summary: CohortSummaryModel[];
}

export interface CohortSummaryModel {
  studentUuid: UUID;
  studentName: string;
  cohortId: number;
  cohortName: string;
  pollinstancesAverage: number;
  pollinstancesCount: number;
}
