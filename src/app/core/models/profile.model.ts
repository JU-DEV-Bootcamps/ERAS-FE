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

export { ERASRoles, Profile };
