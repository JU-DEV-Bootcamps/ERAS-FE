import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const CustomValidators: Record<string, ValidatorFn> = {
  noSpaces: (control: AbstractControl): ValidationErrors | null => {
    const hasSpace = (control.value || '').trim().length === 0;
    return hasSpace ? { noSpaces: true } : null;
  },
  forbiddenChars: (control: AbstractControl): ValidationErrors | null => {
    const forbiddenPattern = /[<>"'%();&+=\\-]/;
    const value = control.value;

    if (value && forbiddenPattern.test(value)) {
      return { forbiddenChars: true };
    }
    return null;
  },
};

/**
 * @desc Detects duplicated values.
 * Note. if backend expose a service with this validation we can
 * removie this one, and implement a sync validator in our factory.
 * @param list - array of the objects to compare.
 * @param property - object atribute to compare.
 */
export function duplicate<T>(list: T[], property: keyof T): ValidatorFn {
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
