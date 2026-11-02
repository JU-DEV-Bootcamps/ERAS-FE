import { Lookup } from '@core/models/lookup';
import {
  StudentInterventionKind,
  StudentInterventionType,
} from '@core/models/student-intervention.model';

/** Same limit as the API; the description is plain text. */
export const STUDENT_INTERVENTION_DESCRIPTION_MAX_LENGTH = 1000;

export const STUDENT_INTERVENTION_TYPE_LABELS: Record<
  StudentInterventionType,
  string
> = {
  Academic: 'Academic',
  Financial: 'Financial',
  Attendance: 'Attendance',
  Personal: 'Personal',
  Tutoring: 'Tutoring',
  Advising: 'Advising',
  FinancialAid: 'Financial aid',
  Referral: 'Referral',
};

export const STUDENT_INTERVENTION_TYPES_BY_KIND: Record<
  StudentInterventionKind,
  StudentInterventionType[]
> = {
  RiskIdentified: ['Academic', 'Financial', 'Attendance', 'Personal'],
  SupportReceived: ['Tutoring', 'Advising', 'FinancialAid', 'Referral'],
};

export function studentInterventionTypeOptions(
  kind: StudentInterventionKind
): Lookup[] {
  return STUDENT_INTERVENTION_TYPES_BY_KIND[kind].map(type => ({
    label: STUDENT_INTERVENTION_TYPE_LABELS[type],
    value: type,
  }));
}
