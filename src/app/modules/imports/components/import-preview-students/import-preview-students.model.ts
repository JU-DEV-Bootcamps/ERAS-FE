import { Column } from '@shared/components/list/types/column';
import { StudentModelPreview } from '@shared/components/list/types/preview';

export const MandatoryColumns: Column<StudentModelPreview>[] = [
  { key: 'studentId', label: 'Id' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'uuid', label: 'SIS Id' },
];

export const OptionalColumns: Column<StudentModelPreview>[] = [
  { key: 'enrolledCourses', label: 'Enrolled' },
  { key: 'gradedCourses', label: 'Graded' },
  { key: 'timeDeliveryRate', label: 'Timely sub.' },
  { key: 'avgScore', label: 'Avg. score' },
  { key: 'coursesUnderAvg', label: 'Below avg.' },
  { key: 'pureScoreDiff', label: 'Raw diff.' },
  { key: 'standardScoreDiff', label: 'Std. diff.' },
  { key: 'lastAccessDays', label: 'Days since access' },
];

export const CSV_KEY_TO_MODEL_KEY: Record<string, keyof StudentModelPreview> = {
  EnrolledCourses: 'enrolledCourses',
  GradedCourses: 'gradedCourses',
  TimelySubmissions: 'timeDeliveryRate',
  AverageScore: 'avgScore',
  CoursesBelowAverage: 'coursesUnderAvg',
  RawScoreDifference: 'pureScoreDiff',
  StandardScoreDifference: 'standardScoreDiff',
  DaysSinceLastAccess: 'lastAccessDays',
};
