export interface PollInstanceResponse {
  body: PollInstance[];
  success: boolean;
  message: string;
}

export interface PollInstance {
  uuid: string;
  student: Student;
  audit: Audit;
  finishedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow dynamic access
}

export interface Student {
  id: number;
  uuid: string;
  name: string;
  email: string;
  studentDetail: StudentDetail;
  audit: Audit;
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
}

export interface Audit {
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  modifiedAt: string;
}
