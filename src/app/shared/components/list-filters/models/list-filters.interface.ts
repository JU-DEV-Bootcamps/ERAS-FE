import { ValidatorFn } from '@angular/forms';
import {
  MultipleSelectItem,
  SingleSelectItem,
} from '@shared/components/form-field-virtual-scroll/interfaces/select';

interface AppliedFilter {
  name: string;
  value: FilterValue;
}

enum FilterType {
  virtualSelect = 'virtual-select',
  virtualMultiSelect = 'virtual-multi-select',
}

interface FilterField {
  disabled: boolean;
  id: string;
  label: string;
  value: FilterValue;
  type: FilterType;
  options?: SingleSelectItem[] | MultipleSelectItem[];
  validators?: (ValidatorFn | string)[];
}

type FilterValue = string | number | string[] | null;

export { AppliedFilter, FilterField, FilterType, FilterValue };
