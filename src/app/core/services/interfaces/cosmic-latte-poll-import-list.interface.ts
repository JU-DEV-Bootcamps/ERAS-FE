import { BaseModel } from '../../models/common/base.model';

//TODO!: Needs refactor for dates as strings, uuid as string?
export interface Audit {
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  modifiedAt: string;
}
export interface Student {
  id: number;
  uuid: string | null;
  name: string;
  email: string;
  studentDetail: null;
  cohort: Cohort;
  audit: Audit | null;
}
interface Cohort {
  name: string;
  courseCode: string;
  audit: Audit | null;
}
interface Answer {
  answer: string;
  score: number;
  pollInstanceId: number;
  pollVariableId: number;
  student: Student;
  audit: Audit | null;
}
interface Variable {
  name: string;
  position: number;
  type: string;
  answer: Answer;
  audit: Audit | null;
}
interface Component {
  name: string;
  variables: Variable[];
  audit: Audit | null;
}

export interface PollInstance extends BaseModel {
  idCosmicLatte: string;
  uuid: string;
  name: string;
  version: string;
  finishedAt: string;
  components: Component[];
}
