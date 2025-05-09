import { BaseModel } from './common/base.model';

export interface CohortModel extends BaseModel {
  name: string;
  courseCode: string;
}

export interface StudentRiskResponse {
  studentId: number;
  studentName: string;
  answerAverage: number;
  riskSum: number;
}
