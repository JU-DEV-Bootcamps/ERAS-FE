import { FormGroup, ValidatorFn } from '@angular/forms';
import { EventEmitter, InputSignal } from '@angular/core';

import { FormUtils } from '@core/utils/forms/form-utils';
import { Lookup } from '@core/models/lookup';
import { FloatLabelType } from '@angular/material/form-field';

export type FieldType =
  | 'date'
  | 'select'
  | 'text'
  | 'textarea'
  | 'password'
  | 'searchableSelect'
  | 'file';

export type ValueType = string | number | boolean | Date | null | string[];

export type FormControlTuple = Record<
  string,
  [{ value: ValueType; disabled: boolean }, ValidatorFn[]]
>;
export type FormDataTuple = Record<string, ValueType>;

// Used to model our formFields variables.
export interface DynamicField {
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  validators?: (ValidatorFn | string)[];
  value?: ValueType;
  options?: Lookup[];
  multipleSelect?: boolean;
  disabled?: boolean;
  floatingLabel?: FloatLabelType;
}

// Used to implements a dynamic form.
export interface FormCreation {
  formInstance: EventEmitter<FormGroup>;
  formFields: DynamicField[];
}

// Used to model the different input types components.
export interface DynamicInputComponent {
  field: InputSignal<DynamicField>;
  form: InputSignal<FormGroup>;
  formUtils: typeof FormUtils;
}
