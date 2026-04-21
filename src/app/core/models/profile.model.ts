export type ErasRole =
  | 'Eras Admin'
  | 'Professional'
  | 'Student Service'
  | 'User';

export interface Profile {
  firstName?: string;
  id?: string;
  lastName?: string;
  role?: ErasRole;
}

export function isErasRole(role: string): role is ErasRole {
  const erasRoles = ['Eras Admin', 'Professional', 'Student Service', 'User'];
  return erasRoles.includes(role);
}
