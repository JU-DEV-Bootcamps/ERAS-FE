import { StudentModel } from './student.model';

export interface StudentResponse {
  entity: StudentModel;
  message: string;
  success: boolean;
}
