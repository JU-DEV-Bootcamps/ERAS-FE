import { UUID } from 'crypto';
import { PollModel } from './poll.model';
import { PollInstanceModel } from './poll-instance.model';
import { BaseModel } from './common/base.model';
import { ComponentValueType } from '../../features/heat-map/types/risk-students-detail.type';

export const ENTITY_NAMES = [
  'Students',
  'Cohorts',
  'Evaluations',
  'Polls',
  'PollInstances',
] as const;
export type EntityName = (typeof ENTITY_NAMES)[number];
export type CountSummaryModel = Record<EntityName, number>;

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

export interface EvaluationModel extends BaseModel {
  name: string;
  status: string;
  startDate: Date;
  endDate: Date;
  pollName: string;
  pollId: 0;
  evaluationPollId: number;
  polls: PollModel[];
  pollInstances: PollInstanceModel[];
}

export interface PollAvgReport {
  pollCount: number;
  components: PollAvgComponent[];
}

export interface PollAvgComponent {
  description: ComponentValueType;
  averageRisk: number;
  questions: PollAvgQuestion[];
}

export interface BasePollQuestion {
  question: string;
  averageRisk: number;
  position: number;
}

export interface PollAvgQuestion extends BasePollQuestion {
  averageAnswer: string;
  answersDetails: AnswerDetail[];
}
export interface PollCountQuestion extends BasePollQuestion {
  answers: PollCountAnswer[];
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

export type PollTopReport = StudentReportAnswerRiskLevel[];

export interface StudentReportAnswerRiskLevel {
  pollUuid: string;
  componentName: string;
  pollVariableId: number;
  question: string;
  answerText: string;
  pollInstanceId: number;
  studentName: string;
  studentEmail: string;
  answerRisk: number;
  pollInstanceRiskSum: number;
  pollInstanceAnswersCount: number;
  componentAverageRisk: number;
  variableAverageRisk: number;
  answerCount: number;
  answerPercentage: number;
  cohortId: number;
  cohortName?: string;
  averageRiskByCohortComponent: number;
  studentId: number;
}

export interface PollCountReport {
  components: PollCountComponent[];
}

export interface PollCountComponent {
  description: ComponentValueType;
  text: string;
  questions: PollCountQuestion[];
}

export interface PollCountAnswer {
  answerText: string;
  answerRisk: number;
  count: number;
  students: PollCountStudent[];
}

export interface PollCountStudent {
  name: string;
  email: string;
  cohortId: number;
  cohortName: string;
}
