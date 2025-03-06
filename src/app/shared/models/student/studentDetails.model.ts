import { Audit } from '../audit.model';

export interface Entity {
  studentId: number;
  enrolledCourses: number;
  gradedCourses: number;
  timeDeliveryRate: number;
  avgScore: number;
  coursesUnderAvg: number;
  pureScoreDiff: number;
  standardScoreDiff: number;
  lastAccessDays: number;
  audit: Audit;
}

export interface StudentDetails {
  entity: Entity;
  message: string;
  success: boolean;
}
