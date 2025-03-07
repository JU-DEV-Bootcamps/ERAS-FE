export interface Cohort {
  id: number;
  name: string;
  courseCode: string;
  audit: {
    createdBy: string;
    modifiedBy: string;
    createdAt: string;
    modifiedAt: string;
  };
}