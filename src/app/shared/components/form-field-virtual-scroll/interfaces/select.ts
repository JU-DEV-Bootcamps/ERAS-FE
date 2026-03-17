import { SelectAllValue } from '@shared/directives/select-all-value';

export interface SelectGroup {
  label: string;
  items: MultipleSelectItem[];
}

export interface BaseItem {
  label: string;
}

export interface SingleSelectItem extends BaseItem {
  value: string | number | boolean | { id: number };
}

export interface MultipleSelectCommonItem extends BaseItem {
  type?: 'common';
  value: SelectAllValue;
}

export interface MultipleSelectGroup extends BaseItem {
  type: 'group';
}

export type MultipleSelectItem = MultipleSelectCommonItem | MultipleSelectGroup;
