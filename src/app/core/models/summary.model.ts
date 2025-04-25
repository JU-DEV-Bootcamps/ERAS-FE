import { UUID } from 'crypto';
import { Audit } from '../../shared/models/audit.model';
import { PollModel } from './poll.model';
import { PollInstanceModel } from './poll-instance.model';

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

export interface EvaluationSummaryModel {
  entities: EvaluationModel[];
  success: boolean;
  message: string;
}
export interface EvaluationModel {
  name: string;
  status: string;
  startDate: Date;
  endDate: Date;
  pollName: string;
  pollId: 0;
  evaluationPollId: number;
  polls: PollModel[];
  pollInstances: PollInstanceModel[];
  audit: Audit;
  id: number;
}
