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
export interface Cohort {
  name: string;
  courseCode: string;
  audit: Audit | null;
}
export interface Answer {
  answer: string;
  score: number;
  pollInstanceId: number;
  pollVariableId: number;
  student: Student;
  audit: Audit | null;
}
export interface Variable {
  name: string;
  position: number;
  type: string;
  answer: Answer;
  audit: Audit | null;
}
export interface Component {
  name: string;
  variables: Variable[];
  audit: Audit | null;
}
export interface PollInstance {
  id: number;
  idCosmicLatte: string;
  uuid: string;
  name: string;
  version: string;
  finishedAt: string;
  components: Component[];
  audit: Audit | null;
}
