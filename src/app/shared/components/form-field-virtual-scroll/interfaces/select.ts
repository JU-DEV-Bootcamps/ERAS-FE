import { SelectAllValue } from '@shared/directives/select-all-value';

export interface SelectGroup {
  label: string;
  items: Item[];
}

export interface BaseItem {
  label: string;
}

export interface CommonItem extends BaseItem {
  type?: 'common';
  value: SelectAllValue;
}

export interface GroupItem extends BaseItem {
  type: 'group';
}

export type Item = CommonItem | GroupItem;
