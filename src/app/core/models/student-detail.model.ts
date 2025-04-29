import { BaseModel } from './common/base.model';

export interface StudentDetailModel extends BaseModel {
  studentId: number;
  enrolledCourses: number;
  gradedCourses: number;
  timeDeliveryRate: number;
  avgScore: number;
  coursesUnderAvg: number;
  pureScoreDiff: number;
  standardScoreDiff: number;
  lastAccessDays: number;
}
