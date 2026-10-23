import { StudentModelFlat } from '@core/models/student.model';

export interface PreviewColumn {
  key: string;
  label: string;
}

export interface StudentModelPreview {
  studentId: number;
  name: string;
  email: string;
  uuid: string;
  status?: boolean;
  error?: string;
  enrolledCourses?: number;
  gradedCourses?: number;
  timeDeliveryRate?: number;
  avgScore?: number;
  coursesUnderAvg?: number;
  pureScoreDiff?: number;
  standardScoreDiff?: number;
  lastAccessDays?: number;
}

export interface PreviewRow {
  data: StudentModelPreview;
  errors: string[];
  selected?: boolean;
  index?: number;
}

export interface ImportPreviewConfirm {
  rows: StudentModelFlat[];
}
