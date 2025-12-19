import { FormGroup, ValidationErrors } from '@angular/forms';
import { DynamicField } from '@core/factories/forms/form-factory.interface';

export class FormUtils {
  static isValidField(form: FormGroup, field: string): boolean | null {
    return !!form.controls[field].errors;
  }

  static getFieldError(form: FormGroup, field: DynamicField): string | null {
    if (!form.controls[field.name]) return null;
    const errors = form.controls[field.name]['errors'] ?? {};

    return FormUtils.getTextError(errors, field.label);
  }

  static getTextError(errors: ValidationErrors, field: string): string | null {
    const errorMessages: Record<string, () => string> = {
      required: () => `${field} is required.`,
      noSpaces: () => `${field} cannot contain spaces.`,
      forbiddenChars: () => `${field} contains forbidden characters.`,
      duplicate: () => `${field} must be unique.`,
      minlength: () =>
        `${field} must have at least ${errors['minlength'].requiredLength} characters.`,
      maxlength: () =>
        `${field} must have maximun ${errors['maxlength'].requiredLength} characters.`,
    };

    const key = Object.keys(errors).find(key => errorMessages[key]);
    return key ? errorMessages[key]() : null;
  }
}
