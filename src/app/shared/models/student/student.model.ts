import { CohortModel } from '../../../core/models/cohort.model';
import { Audit } from '../audit.model';

export interface Entity {
  uuid: string;
  name: string;
  email: string;
  studentDetail: StudentDetail;
  audit: Audit;
  cohortId: number;
  cohort: null | CohortModel;
  id: number;
}

export interface StudentDetail {
  studentId: number;
  enrolledCourses: number;
  gradedCourses: number;
  timeDeliveryRate: number;
  avgScore: number;
  coursesUnderAvg: number;
  pureScoreDiff: number;
  standardScoreDiff: number;
  lastAccessDays: number;
  audit: null;
  id: number;
}

export interface Student {
  entity: Entity;
  message: string;
  success: boolean;
}
