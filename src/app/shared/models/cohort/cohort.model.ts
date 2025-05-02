import { Audit } from '../audit.model';

export interface Cohort {
  name: string;
  courseCode: string;
  audit: Audit;
  id: number;
}

export interface CohortStudentsRiskByPollResponse {
  studentId: number;
  studentName: string;
  riskSum: number;
}
