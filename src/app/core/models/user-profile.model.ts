export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
  employeeId: string;
  department: string;
  position: string;
  phone: string;
  role: string;
  about: string;
  /** Read-only: open assessments created by or assigned to the user. */
  activeAssessmentsCount?: number;
  /** Read-only: open interventions created by the user. */
  activeInterventionsCount?: number;
}

export type UpdateUserProfileRequest = Pick<
  UserProfile,
  'employeeId' | 'department' | 'position' | 'phone' | 'about'
>;
