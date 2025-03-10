import { UUID } from 'crypto';
import { StudentModel } from './StudentModel';

export interface PollModel {
  name: string;
  version: string;
  uuid: UUID;
  audit?: {
    createdBy: string;
    modifiedBy: string;
    createdAt: Date;
    modifiedAt: Date;
  };
  components: [];
  id: number;
  //TODO: move to Evaluation process interface
  average?: number;
  publishedDate?: Date;
  deadlineDate?: Date;
  progress?: string;
  riskStudents?: StudentModel[];
}
