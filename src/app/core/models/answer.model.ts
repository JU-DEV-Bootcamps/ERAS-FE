import { BaseModel } from './common/base.model';
import { VariableModel } from './variable.model';

export interface AnswerModel extends BaseModel {
  answerText: string;
  riskLevel: number;
  variable: VariableModel;
  pollInstanceId: number;
  pollVariableId: number;
}
