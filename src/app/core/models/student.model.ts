import { BaseModel } from './common/base.model';
import { UUID } from 'crypto';
import { StudentDetailModel } from './student-detail.model';

export interface StudentModel extends BaseModel {
  uuid: UUID;
  name: string;
  email: string;
  isImported: boolean;
  studentDetail: StudentDetailModel;
  cohortId: number;
  // public Cohort? Cohort { get; set; } = default!;
}
