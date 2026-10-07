export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
  employeeId: string;
  department: string;
  phone: string;
  role: string;
  about: string;
}

export type UpdateUserProfileRequest = Pick<
  UserProfile,
  'employeeId' | 'department' | 'phone' | 'about'
>;
