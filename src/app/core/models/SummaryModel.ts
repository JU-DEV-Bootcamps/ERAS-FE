import { UUID } from 'crypto';
import { Audit } from '../../shared/models/audit.model';
import { PollModel } from './PollModel';
import { PoollInstanceModel } from './PollInstanceModel';

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
  pollInstances: PoollInstanceModel[];
  audit: Audit;
  id: number;
}

export interface PollAvgReport {
  pollCount: number;
  components: PollAvgComponent[];
}

export interface PollAvgComponent {
  description: string;
  averageRisk: number;
  questions: PollAvgQuestion[];
}

export interface PollAvgQuestion {
  question: string;
  averageAnswer: string;
  averageRisk: number;
  answersDetails: AnswerDetail[];
}

export interface AnswerDetail {
  answerText: string;
  answerPercentage: number;
  studentsEmails: string[];
}

export interface GetQueryResponse<T> {
  status: string;
  message?: string;
  body: T;
}
