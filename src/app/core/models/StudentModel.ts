import { UUID } from 'crypto';

export interface StudentModel {
  uuid: UUID;
  name: string;
  email: string;
  studentDetail?: {
    studentId: number;
    enrolledCourses: number;
    gradedCourses: number;
    timeDeliveryRate: number;
    avgScore: number;
    coursesUnderAvg: number;
    pureScoreDiff: number;
    standardScoreDiff: number;
    lastAccessDays: number;
    audit: string;
    id: number;
  };
  audit?: {
    createdBy: string;
    modifiedBy: string;
    createdAt: Date;
    modifiedAt: Date;
  };
  cohortId: number;
  cohort: string;
  id: number;
}
