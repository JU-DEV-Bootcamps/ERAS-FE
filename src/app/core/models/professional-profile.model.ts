interface ProfessionalCourse {
  code: string;
  name: string;
}

interface ProfessionalProfile {
  position: string;
  faculty: string;
  officeHours: string;
  activeEvaluations: string;
  subjectsTaught: string[];
  courses: ProfessionalCourse[];
}

export { ProfessionalCourse, ProfessionalProfile };
