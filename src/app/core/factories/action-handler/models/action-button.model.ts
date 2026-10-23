import { ActionType } from './action-type.enum';

export interface ActionButton {
  type: ActionType;
  icon: string;
  tooltip?: string;
  disabled?: boolean;
}
