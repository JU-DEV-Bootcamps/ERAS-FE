import { BaseModel } from './common/base.model';
import { VariableModel } from './variable.model';

export interface ComponentModel extends BaseModel {
  name: string;
  variables: VariableModel[];
}
