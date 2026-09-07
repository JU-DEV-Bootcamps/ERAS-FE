import { FormControl, FormGroup } from '@angular/forms';
import { DynamicField } from '@core/factories/forms/form-factory.interface';
import { FormUtils } from './form-utils';

describe('FormUtils', () => {
  let form: FormGroup;

  beforeEach(() => {
    form = new FormGroup({
      username: new FormControl(''),
      email: new FormControl(''),
    });
  });

  describe('isValidField', () => {
    it('should return true if field has errors', () => {
      form.controls['username'].setErrors({ required: true });
      expect(FormUtils.isValidField(form, 'username')).toBeTrue();
    });

    it('should return false if field has no errors', () => {
      expect(FormUtils.isValidField(form, 'username')).toBeFalse();
    });
  });

  describe('getFieldError', () => {
    const field: DynamicField = {
      name: 'username',
      label: 'Username',
    } as DynamicField;

    it('should return null if control does not exist in form', () => {
      const nonExistentField: DynamicField = {
        name: 'nonExistent',
        label: 'Non Existent',
      } as DynamicField;

      expect(FormUtils.getFieldError(form, nonExistentField)).toBeNull();
    });

    it('should return null if control has no errors', () => {
      expect(FormUtils.getFieldError(form, field)).toBeNull();
    });

    it('should return formatted error message if control has errors', () => {
      form.controls['username'].setErrors({ required: true });
      expect(FormUtils.getFieldError(form, field)).toBe(
        'Username is required.'
      );
    });
  });

  describe('getTextError', () => {
    const label = 'Field';

    it('should return correct message for required error', () => {
      expect(FormUtils.getTextError({ required: true }, label)).toBe(
        'Field is required.'
      );
    });

    it('should return correct message for noSpaces error', () => {
      expect(FormUtils.getTextError({ noSpaces: true }, label)).toBe(
        'Field cannot contain spaces.'
      );
    });

    it('should return correct message for forbiddenChars error', () => {
      expect(FormUtils.getTextError({ forbiddenChars: true }, label)).toBe(
        'Field contains forbidden characters.'
      );
    });

    it('should return correct message for duplicate error', () => {
      expect(FormUtils.getTextError({ duplicate: true }, label)).toBe(
        'Field must be unique.'
      );
    });

    it('should return correct message for minlength error', () => {
      const errors = { minlength: { requiredLength: 5 } };
      expect(FormUtils.getTextError(errors, label)).toBe(
        'Field must have at least 5 characters.'
      );
    });

    it('should return correct message for maxlength error', () => {
      const errors = { maxlength: { requiredLength: 10 } };
      expect(FormUtils.getTextError(errors, label)).toBe(
        'Field must have maximun 10 characters.'
      );
    });

    it('should return correct message for maxFiles error', () => {
      const errors = { maxFiles: { max: 3 } };
      expect(FormUtils.getTextError(errors, label)).toBe(
        'Field The maximum 3 file(s) allowed.'
      );
    });

    it('should return correct message for maxSize error', () => {
      const errors = {
        maxSize: { fileName: 'file.png', maxMb: 2 * 1024 * 1024 },
      };
      expect(FormUtils.getTextError(errors, label)).toBe(
        '"file.png" exceeds 2MB.'
      );
    });

    it('should return correct message for fileFormat error', () => {
      const errors = {
        fileFormat: { fileName: 'file.txt', extensions: '.png, .jpg' },
      };
      expect(FormUtils.getTextError(errors, label)).toBe(
        'Field: "file.txt" has an unsupported format. Allowed: .png, .jpg'
      );
    });

    it('should return correct message for duplicated error', () => {
      const errors = { duplicated: { fileName: 'doc.pdf' } };
      expect(FormUtils.getTextError(errors, label)).toBe(
        'doc.pdf has already been added.'
      );
    });

    it('should return correct message for min error', () => {
      const errors = { min: { min: 18 } };
      expect(FormUtils.getTextError(errors, label)).toBe(
        'Field cannot be lower 18.'
      );
    });

    it('should return correct message for max error', () => {
      const errors = { max: { max: 100 } };
      expect(FormUtils.getTextError(errors, label)).toBe(
        'Field cannot exceeds 100.'
      );
    });

    it('should return null if error is not recognized or empty', () => {
      expect(FormUtils.getTextError({}, label)).toBeNull();
      expect(
        FormUtils.getTextError({ customUnknownError: true }, label)
      ).toBeNull();
    });
  });

  describe('setErrors', () => {
    it('should set errors on the specified form control', () => {
      const customErrors = { customError: true };
      FormUtils.setErrors(customErrors, form, 'username');

      expect(form.controls['username'].errors).toEqual(customErrors);
    });
  });
});
