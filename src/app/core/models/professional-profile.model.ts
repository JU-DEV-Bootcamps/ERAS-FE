// Mirrors the backend ProfessionalProfileDTO (camelCase JSON). Position is stored on the user record.
interface ProfessionalCourse {
  code: string;
  name: string;
}

interface ProfessionalProfile {
  position: string;
  faculty: string;
  officeHours: string;
  subjectsTaught: string[];
  courses: ProfessionalCourse[];
}

export { ProfessionalCourse, ProfessionalProfile };
