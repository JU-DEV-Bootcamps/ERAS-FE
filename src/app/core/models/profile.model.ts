enum ERASRoles {
  ADMIN = 'ERAS Administrator',
  PROFESSIONAL = 'ERAS Professional',
  OFFICER = 'ERAS Student Services Officer',
  GUEST = 'Guest',
}

interface Profile {
  firstName?: string;
  id?: string;
  lastName?: string;
  role?: ERASRoles;
  fullName?: string;
}

function isErasRole(role: string): role is ERASRoles {
  return Object.values(ERASRoles).includes(role as ERASRoles);
}

export { ERASRoles, isErasRole, Profile };
