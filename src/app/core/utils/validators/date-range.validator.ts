import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateRangeValidator(
  startControlName: string,
  endControlName: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startControlName)?.value;
    const end = group.get(endControlName)?.value;

    if (!start || !end) {
      return null;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return null;
    }

    return endDate < startDate ? { dateRangeInvalid: true } : null;
  };
}

export function yearRangeValidator(
  minYear: number,
  maxYear: number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    const year = date.getFullYear();
    return year < minYear || year > maxYear
      ? { yearOutOfRange: { min: minYear, max: maxYear } }
      : null;
  };
}
