import { AbstractControl, ValidationErrors } from '@angular/forms';

export function forbiddenCharsValidator(
  control: AbstractControl
): ValidationErrors | null {
  const forbiddenPattern = /[<>"'%();&+=\\-]/;
  const value = control.value;

  if (value && forbiddenPattern.test(value)) {
    return { forbiddenChars: true };
  }

  return null;
}
