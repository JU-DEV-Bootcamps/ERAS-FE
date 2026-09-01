import { validateName } from './name.validator';

describe('validateName', () => {
  it('should return an error when the value is empty', () => {
    expect(validateName('')).toBe('Name cannot be empty.');
  });

  it('should return an error when the value is only whitespace', () => {
    expect(validateName('   ')).toBe('Name cannot be empty.');
  });

  it('should return an error when the value starts with a space', () => {
    expect(validateName(' Speech Therapy')).toBe(
      'Name cannot start with a space.'
    );
  });

  it('should return an error when the value is shorter than the minimum length', () => {
    expect(validateName('A')).toBe('Name must be at least 2 characters long.');
  });

  it('should return an error when the value exceeds the maximum length', () => {
    const tooLong = 'A'.repeat(101);
    expect(validateName(tooLong)).toBe('Name cannot exceed 100 characters.');
  });

  it('should accept a value at exactly the maximum length', () => {
    const maxLength = 'A'.repeat(100);
    expect(validateName(maxLength)).toBeNull();
  });

  it('should return an error when the value contains disallowed characters', () => {
    expect(validateName('.,?><:')).toBe(
      "Only letters, numbers, spaces, and the characters . , ' & ( ) / - are allowed."
    );
  });

  it('should accept a plain alphanumeric name', () => {
    expect(validateName('Speech Therapy 101')).toBeNull();
  });

  it('should accept names with accented characters and ñ', () => {
    expect(validateName('Psicología Infantil')).toBeNull();
  });

  it('should accept names with allowed punctuation', () => {
    expect(
      validateName("O'Brien Physical Therapy & Rehab (Group 1/2)")
    ).toBeNull();
  });

  it('should reject a name that is only disallowed symbols', () => {
    expect(validateName('@#$%')).toBe(
      "Only letters, numbers, spaces, and the characters . , ' & ( ) / - are allowed."
    );
  });
});
