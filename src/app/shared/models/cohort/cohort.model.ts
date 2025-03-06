import { Audit } from '../audit.model';

export interface cohort {
  name: string;
  courseCode: string;
  audit: Audit;
  id: number;
}
