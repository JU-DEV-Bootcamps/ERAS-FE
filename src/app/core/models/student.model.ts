import { BaseModel } from './common/base.model';
import { StudentDetailModel } from './student-detail.model';
import { CohortModel } from './cohort.model';

export interface StudentModel extends BaseModel {
  uuid: string;
  name: string;
  email: string;
  isImported: boolean;
  studentDetail: StudentDetailModel;
  cohortId: number;
  cohort?: CohortModel;
}

export interface Student extends BaseModel {
  uuid: string | null;
  name: string;
  email: string;
  studentDetail: StudentDetailModel | null;
  cohort: CohortModel;
}
