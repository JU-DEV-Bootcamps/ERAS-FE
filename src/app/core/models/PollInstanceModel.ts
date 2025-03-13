import { UUID } from 'crypto';
import { StudentModel } from './StudentModel';
import { Audit } from '../../shared/models/audit.model';
export interface PoollInstanceModel {
  uuid: UUID;
  student: StudentModel;
  answers: [];
  audit: Audit;
  finishedAt: Date;
  id: number;
}
