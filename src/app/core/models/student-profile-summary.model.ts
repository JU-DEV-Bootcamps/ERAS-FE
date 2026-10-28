import { StudentRegistrationModel } from './student-registration.model';

export interface StudentCurrentCourse {
  name: string;
  group?: string | null;
  section?: string | null;
}

/**
 * Response of `GET students/{id}/profile`. Everything beyond the registration
 * data is optional until the BE data migration is complete.
 */
export interface StudentProfileSummaryModel extends StudentRegistrationModel {
  sisId?: string | null;
  cohortName?: string | null;
  cgpa?: number | null;
  sapStatus?: string | null;
  isCurrentCourseThirdAttempt?: boolean | null;
  currentCourses?: StudentCurrentCourse[] | null;
  passedCourses?: number | null;
  failedCourses?: number | null;
  identifiedRisks?: string[] | null;
  supportReceived?: string[] | null;
}
