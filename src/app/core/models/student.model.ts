import { BaseModel } from './common/base.model';
import { StudentDetailModel } from './student-detail.model';
import { CohortModel } from './cohort.model';
import { SelectableModel } from './common/selectable.model';

export interface StudentModel extends SelectableModel {
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

export interface StudentModelFlat
  extends
    Omit<StudentModel, 'studentDetail'>,
    Omit<StudentDetailModel, 'id' | 'audit'> {}
