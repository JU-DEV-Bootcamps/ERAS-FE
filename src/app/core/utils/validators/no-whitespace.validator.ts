import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noWhitespaceValidator(
  control: AbstractControl
): ValidationErrors | null {
  const isWhitespace = (control.value || '').trim().length === 0;
  return isWhitespace ? { whitespace: true } : null;
}
