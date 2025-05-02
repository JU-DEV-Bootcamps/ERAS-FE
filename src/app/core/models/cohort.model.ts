import { BaseModel } from './common/base.model';

export interface CohortModel extends BaseModel {
  name: string;
  courseCode: string;
}

export interface CohortStudentsRiskByPollResponse {
  studentId: number;
  studentName: string;
  riskSum: number;
}
