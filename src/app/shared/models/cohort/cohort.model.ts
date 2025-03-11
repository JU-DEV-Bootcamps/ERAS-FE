import { Audit } from '../audit.model';

export interface Cohort {
  name: string;
  courseCode: string;
  audit: Audit;
  id: number;
}
