import { BaseModel } from './common/base.model';
import { Student } from './student.model';
import { VariableModel } from './variable.model';

export interface AnswerModel extends BaseModel {
  answerText: string;
  riskLevel: number;
  variable: VariableModel;
  pollInstanceId: number;
  pollVariableId: number;
}

export interface Answer extends BaseModel {
  answer: string;
  score: number;
  pollInstanceId: number;
  pollVariableId: number;
  student: Student;
}
