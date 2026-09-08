const enum ERASRoles {
  ADMIN = 'ERAS Administrator',
  PROFESSIONAL = 'ERAS Professional',
  OFFICER = 'ERAS Student Services Officer',
}

type ErasRole = 'Eras Admin' | 'Professional' | 'Student Service' | 'User';
interface Profile {
  firstName?: string;
  id?: string;
  lastName?: string;
  role?: ErasRole;
  fullName?: string;
}

function isErasRole(role: string): role is ErasRole {
  const erasRoles = ['Eras Admin', 'Professional', 'Student Service', 'User'];
  return erasRoles.includes(role);
}

export { ERASRoles, ErasRole, isErasRole, Profile };
