import { BaseModel } from './common/base.model';
import { StudentModel } from './student.model';
import { AnswerModel } from './answer.model';

export interface PollInstanceModel extends BaseModel {
  uuid: string;
  finishedAt: Date;
  student: StudentModel;
  answers: AnswerModel[];
}
