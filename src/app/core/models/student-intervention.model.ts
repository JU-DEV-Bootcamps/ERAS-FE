export type StudentInterventionKind = 'RiskIdentified' | 'SupportReceived';

export type StudentInterventionType =
  | 'Academic'
  | 'Financial'
  | 'Attendance'
  | 'Personal'
  | 'Tutoring'
  | 'Advising'
  | 'FinancialAid'
  | 'Referral';

/** A risk identified for a student or a support the student received. */
export interface StudentInterventionModel {
  id: number;
  studentId: number;
  kind: StudentInterventionKind;
  type: StudentInterventionType;
  description: string;
  /** `yyyy-MM-dd` */
  entryDate: string;
  /** Keycloak sub of the creator; compare with the signed-in user to know whose entry it is. */
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

/** Body to add or edit an entry; the creator and creation time are set by the API. */
export interface SaveStudentInterventionModel {
  kind: StudentInterventionKind;
  type: StudentInterventionType;
  description: string;
  entryDate: string;
}
