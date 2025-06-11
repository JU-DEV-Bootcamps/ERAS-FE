export type ActionColumnLabel = 'Update' | 'Delete';

export type ActionData = ActionDataText | ActionDataIcon;

export interface BaseDataAction {
  label: string;
  columnId: string;
  id: string;
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

export interface ActionDataWithCondition<T> extends ActionDataIcon {
  isRenderable: (item: T) => boolean;
}

export type ActionDatas<T = unknown> = (
  | ActionData
  | ActionDataWithCondition<T>
)[];
