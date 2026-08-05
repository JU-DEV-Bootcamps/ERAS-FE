import { ValidatorFn } from '@angular/forms';
import {
  MultipleSelectItem,
  SingleSelectItem,
} from '@shared/components/form-field-virtual-scroll/interfaces/select';

interface AppliedFilter {
  name: FilterName;
  value: FilterValue;
}

enum FilterName {
  Assessment = 'assessment',
  Status = 'status',
  Type = 'type',
  Risk = 'risk',
}

enum FilterType {
  virtualSelect = 'virtual-select',
  virtualMultiSelect = 'virtual-multi-select',
}

interface FilterField {
  disabled: boolean;
  name: FilterName;
  label: string;
  value: FilterValue;
  type: FilterType;
  options?: SingleSelectItem[] | MultipleSelectItem[];
  validators?: (ValidatorFn | string)[];
}

type FilterValue = string | number | string[] | null;

export { AppliedFilter, FilterField, FilterName, FilterType, FilterValue };
