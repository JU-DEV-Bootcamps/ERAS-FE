import { Audit } from '../audit.model';
import { Cohort } from '../cohort/cohort.model';

export interface Entity {
  uuid: string;
  name: string;
  email: string;
  studentDetail: StudentDetail;
  audit: Audit;
  cohortId: number;
  cohort: null | Cohort;
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
