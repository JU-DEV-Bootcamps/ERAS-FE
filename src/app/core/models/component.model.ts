import { BaseModel } from './common/base.model';
import { Variable, VariableModel } from './variable.model';

export interface ComponentModel extends BaseModel {
  name: string;
  variables: VariableModel[];
}

export interface Component extends BaseModel {
  name: string;
  variables: Variable[];
}
