import { UUID } from 'crypto';
import { PollModel } from './poll.model';
import { PollInstanceModel } from './poll-instance.model';
import { BaseModel } from './common/base.model';
import { StudentModel } from './student.model';
import { VariableModel } from './variable.model';
import { AnswerModel } from './answer.model';

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

export type PollTopReport = StudentQuestionReport[];

export interface StudentQuestionReport {
  student: StudentModel;
  variable: VariableModel;
  answer: AnswerModel;
}
