import { BaseModel } from './base.model';

export interface SelectableModel extends BaseModel {
  isSelected?: boolean;
}
