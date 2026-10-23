import {
  isStudentImport,
  isStudentImportKey,
  StudentImport,
} from './student.interface';

describe('Student Type Guards', () => {
  describe('isStudentImportKey', () => {
    it('should return TRUE if the key belongs to StudentImport', () => {
      expect(isStudentImportKey('Name')).toBe(true);
      expect(isStudentImportKey('Email')).toBe(true);
      expect(isStudentImportKey('DaysSinceLastAccess')).toBe(true);
    });

    it('should return FALSE if the key does not belong to StudentImport', () => {
      expect(isStudentImportKey('InvalidKey')).toBe(false);
      expect(isStudentImportKey('name')).toBe(false);
      expect(isStudentImportKey('id')).toBe(false);
    });
  });

  describe('isStudentImport', () => {
    const validStudent: StudentImport = {
      Name: 'Student name 1',
      Email: 'studennt1@jala.university',
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

    it('should return TRUE for an object that satisfies the StudentImport interface', () => {
      expect(isStudentImport(validStudent)).toBe(true);
    });

    it('should return FALSE if the object is missing at least one property', () => {
      const invalidStudent: Partial<StudentImport> = { ...validStudent };

      delete invalidStudent.SISId;

      expect(isStudentImport(invalidStudent)).toBe(false);
    });

    it('should return FALSE for an object with incorrect properties', () => {
      const wrongObject = {
        Nombre: 'Juan',
        Correo: 'juan@test.com',
        Edad: '20',
      };

      expect(isStudentImport(wrongObject)).toBe(false);
    });
  });
});
