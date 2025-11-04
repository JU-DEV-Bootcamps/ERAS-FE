import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function duplicatePropertyValidator<T>(
  list: T[],
  property: keyof T
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !list) return null;

    const exist = list.some(
      item =>
        String(item[property]).toLowerCase().trim() ===
        String(control.value).toLowerCase().trim()
    );

    return exist ? { duplicate: true } : null;
  };
}
