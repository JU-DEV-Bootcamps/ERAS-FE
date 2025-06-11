export type ActionColumnLabel = 'Update' | 'Delete';

export type ActionData = ActionDataText | ActionDataIcon;

export interface BaseDataAction {
  label: string;
  columnId: string;
}

export interface ActionDataText extends BaseDataAction {
  ngIconName?: never;
  text: string;
}

export interface ActionDataIcon extends BaseDataAction {
  ngIconName: string;
  text?: never;
  tooltip?: string;
}

export type ActionDatas = ActionData[];
