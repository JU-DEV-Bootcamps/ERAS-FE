import { BaseModel } from './common/base.model';

export interface VariableModel extends BaseModel {
  name: string;
  type: string;
  idComponent: number;
  pollVariableId: number;
  idPoll: number;
}
