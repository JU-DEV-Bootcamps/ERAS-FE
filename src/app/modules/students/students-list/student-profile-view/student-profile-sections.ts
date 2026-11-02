import {
  STUDENT_INTERVENTION_MESSAGES,
  STUDENT_PROFILE_MESSAGES,
} from '@core/constants/messages';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';

const messages = STUDENT_PROFILE_MESSAGES;

export type StudentProfileSectionId = 'personal' | 'academic' | 'interventions';

export interface StudentProfileFieldDefinition {
  id: string;
  label: string;
  /** `courses` renders the list of current courses instead of a single value. */
  kind: 'text' | 'courses';
  value?: (profile: StudentProfileSummaryModel) => string | number | null;
  /** A field without a predicate is always listed. */
  isVisible?: (profile: StudentProfileSummaryModel) => boolean;
}

export interface StudentProfileSectionDefinition {
  id: StudentProfileSectionId;
  title: string;
  fields: StudentProfileFieldDefinition[];
}

export function fullName(profile: StudentProfileSummaryModel): string {
  return [profile.firstName, profile.middleName, profile.lastName]
    .filter(Boolean)
    .join(' ');
}

/**
 * Resolves the cohort name of a profile. The BE returns the student's current `cohortId`, so the name is
 * looked up in the cohort list and falls back to the name the profile may already carry.
 */
export function withCohortName(
  profile: StudentProfileSummaryModel,
  cohorts: { id: number | string; name: string }[]
): StudentProfileSummaryModel {
  const cohortName =
    profile.cohortId == null
      ? profile.cohortName
      : (cohorts.find(cohort => Number(cohort.id) === Number(profile.cohortId))
          ?.name ?? profile.cohortName);
  return cohortName === profile.cohortName
    ? profile
    : { ...profile, cohortName };
}

/**
 * The attributes of the student profile, in the order both student modals show them. Fields and order are
 * defined here only, so the profile summary and the student record cannot drift apart.
 */
export const STUDENT_PROFILE_SECTIONS: StudentProfileSectionDefinition[] = [
  {
    id: 'personal',
    title: messages.SECTION_PERSONAL,
    fields: [
      {
        id: 'firstNames',
        label: messages.FIRST_NAMES,
        kind: 'text',
        value: fullName,
      },
      {
        id: 'institutionalEmail',
        label: messages.INSTITUTIONAL_EMAIL,
        kind: 'text',
        value: profile => profile.primaryEmail,
      },
      {
        // Resolved by the BE: the imported identifier of an imported student, else the profile's SIS ID (ADR-0006).
        id: 'sisId',
        label: messages.SIS_ID,
        kind: 'text',
        value: profile => profile.sisId ?? null,
      },
      {
        id: 'mobileNumber',
        label: messages.MOBILE_NUMBER,
        kind: 'text',
        value: profile => profile.mobileNumber ?? null,
      },
      {
        id: 'country',
        label: messages.COUNTRY,
        kind: 'text',
        value: profile => profile.country ?? null,
      },
      {
        id: 'cohort',
        label: messages.COHORT,
        kind: 'text',
        value: profile => profile.cohortName ?? null,
      },
    ],
  },
  {
    id: 'academic',
    title: messages.SECTION_ACADEMIC,
    fields: [
      {
        id: 'cgpa',
        label: messages.CURRENT_CGPA,
        kind: 'text',
        value: profile => profile.cgpa ?? null,
      },
      {
        id: 'sapStatus',
        label: messages.SAP_STATUS,
        kind: 'text',
        value: profile => profile.sapStatus ?? null,
      },
      {
        // Data source of the third-attempt flag: `profile.isCurrentCourseThirdAttempt` (the BE profile column).
        // Only shown when it is true; the data migration plugs in here without changing the layout.
        id: 'thirdAttempt',
        label: messages.THIRD_ATTEMPT,
        kind: 'text',
        value: () => messages.YES,
        isVisible: profile => profile.isCurrentCourseThirdAttempt === true,
      },
      {
        id: 'currentCourses',
        label: messages.CURRENT_COURSES,
        kind: 'courses',
      },
      {
        id: 'passedCourses',
        label: messages.PASSED_COURSES,
        kind: 'text',
        value: profile => profile.passedCoursesCount ?? null,
      },
      {
        id: 'failedCourses',
        label: messages.FAILED_COURSES,
        kind: 'text',
        value: profile => profile.failedCoursesCount ?? null,
      },
    ],
  },
  {
    // Data source: the intervention entries of the student (`StudentInterventionService`), not the profile's
    // former free-text lists. The section body is rendered by the view, in read-only or managing mode.
    id: 'interventions',
    title: STUDENT_INTERVENTION_MESSAGES.SECTION_TITLE,
    fields: [],
  },
];
