import { Answer } from './answer.model';
import { BaseModel } from './common/base.model';

export interface VariableModel extends BaseModel {
  name: string;
  componentName: string;
  idComponent: number;
  pollVariableId: number;
  idPoll: number;
}

export interface Variable extends BaseModel {
  name: string;
  position: number;
  type: string;
  answer: Answer;
}
