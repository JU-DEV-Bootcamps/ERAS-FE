export interface StudentRegistrationModel {
  studentId?: number;
  cohortId?: number | null;
  isImported?: boolean;

  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  countryOfBirth?: string | null;
  idPassportNumber: string;

  primaryEmail: string;
  secondaryEmail?: string | null;
  mobileNumber?: string | null;
  country?: string | null;
  stateProvince?: string | null;
  city?: string | null;
  street?: string | null;
  postalCode?: string | null;

  levelOfStudy?: string | null;
  facultySchool?: string | null;
  studyModality?: string | null;
  previousInstitution?: string | null;
}
