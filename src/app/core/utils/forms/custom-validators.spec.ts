import { FormControl } from '@angular/forms';
import { CustomValidators, duplicate } from './custom-validators';

describe('CustomValidators', () => {
  describe('noSpaces', () => {
    it('should return error if value is empty', () => {
      const control = new FormControl('');
      expect(CustomValidators['noSpaces'](control)).toEqual({ noSpaces: true });
    });

    it('should return error if value is only spaces', () => {
      const control = new FormControl('   ');
      expect(CustomValidators['noSpaces'](control)).toEqual({ noSpaces: true });
    });

    it('should return error if value is null', () => {
      const control = new FormControl(null);
      expect(CustomValidators['noSpaces'](control)).toEqual({ noSpaces: true });
    });

    it('should return null if value has valid characters', () => {
      const control = new FormControl('test value');
      expect(CustomValidators['noSpaces'](control)).toBeNull();
    });
  });

  describe('forbiddenChars', () => {
    it('should return null if value is valid', () => {
      const control = new FormControl('validString123');
      expect(CustomValidators['forbiddenChars'](control)).toBeNull();
    });

    it('should return null if value is empty or null', () => {
      expect(
        CustomValidators['forbiddenChars'](new FormControl(''))
      ).toBeNull();
      expect(
        CustomValidators['forbiddenChars'](new FormControl(null))
      ).toBeNull();
    });

    it('should return error if value contains forbidden characters', () => {
      const chars = [
        '<',
        '>',
        '"',
        "'",
        '%',
        '(',
        ')',
        ';',
        '&',
        '+',
        '=',
        '\\',
        '-',
      ];

      chars.forEach(char => {
        const control = new FormControl(`test${char}value`);
        expect(CustomValidators['forbiddenChars'](control)).toEqual({
          forbiddenChars: true,
        });
      });
    });
  });
});

describe('duplicate validator', () => {
  interface MockItem {
    id: number;
    name: string;
  }

  const mockList: MockItem[] = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
  ];

  it('should return error if value exists in the list exactly', () => {
    const validator = duplicate(mockList, 'name');
    const control = new FormControl('Admin');
    expect(validator(control)).toEqual({ duplicate: true });
  });

  it('should return error if value exists in the list ignoring case and spaces', () => {
    const validator = duplicate(mockList, 'name');
    const control = new FormControl('  aDmiN  ');
    expect(validator(control)).toEqual({ duplicate: true });
  });

  it('should return null if value does not exist in the list', () => {
    const validator = duplicate(mockList, 'name');
    const control = new FormControl('Guest');
    expect(validator(control)).toBeNull();
  });

  it('should return null if control value is null or empty', () => {
    const validator = duplicate(mockList, 'name');
    expect(validator(new FormControl(''))).toBeNull();
    expect(validator(new FormControl(null))).toBeNull();
  });

  it('should return null if list is empty or falsy', () => {
    const validatorEmpty = duplicate([], 'name');
    expect(validatorEmpty(new FormControl('Admin'))).toBeNull();

    const validatorNull = duplicate(undefined as unknown as MockItem[], 'name');
    expect(validatorNull(new FormControl('Admin'))).toBeNull();
  });
});
