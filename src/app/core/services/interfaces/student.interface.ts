export interface StudentRiskAverage {
  studentId: number;
  studentName: string;
  email: string;
  avgRiskLevel: number;
}
export interface StudentImport {
  Name: string;
  Email: string;
  SISId: string;
  EnrolledCourses: string;
  GradedCourses: string;
  TimelySubmissions: string;
  AverageScore: string;
  CoursesBelowAverage: string;
  RawScoreDifference: string;
  StandardScoreDifference: string;
  DaysSinceLastAccess: string;
}

const student: StudentImport = {
  Name: 'Nombre de estudiante 1',
  Email: 'estudiante1@jala.university',
  SISId: 'STU-000',
  EnrolledCourses: '1',
  GradedCourses: '1',
  TimelySubmissions: '20',
  AverageScore: '91.15',
  CoursesBelowAverage: '0',
  RawScoreDifference: '6.26',
  StandardScoreDifference: '86.27',
  DaysSinceLastAccess: '479',
};

export const isStudentImportKey = (key: string): key is keyof StudentImport => {
  return key in student;
};

export const isStudentImport = (object: object): object is StudentImport => {
  return (
    'Name' in object &&
    'Email' in object &&
    'SISId' in object &&
    'EnrolledCourses' in object &&
    'GradedCourses' in object &&
    'TimelySubmissions' in object &&
    'AverageScore' in object &&
    'CoursesBelowAverage' in object &&
    'RawScoreDifference' in object &&
    'StandardScoreDifference' in object &&
    'DaysSinceLastAccess' in object
  );
};
