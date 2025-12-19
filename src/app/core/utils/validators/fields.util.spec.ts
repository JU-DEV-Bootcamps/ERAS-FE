import { isFieldNameValid, isFieldEmailValid } from './fields.util';

describe('isFieldNameValid', () => {
  it('should return true for valid names', () => {
    expect(isFieldNameValid('Juan')).toBeTrue();
    expect(isFieldNameValid('María-José')).toBeTrue();
    expect(isFieldNameValid("O'Connor")).toBeTrue();
    expect(isFieldNameValid('Jean Paul')).toBeTrue();
    expect(isFieldNameValid('Élodie')).toBeTrue();
    expect(isFieldNameValid('Ana María')).toBeTrue();
  });

  it('should return false for invalid names', () => {
    expect(isFieldNameValid('Juan123')).toBeFalse();
    expect(isFieldNameValid('!@#')).toBeFalse();
    expect(isFieldNameValid('')).toBeFalse();
    expect(isFieldNameValid('John_Doe')).toBeFalse();
    expect(isFieldNameValid('  ')).toBeFalse();
    expect(isFieldNameValid('Juan--Carlos')).toBeFalse();
  });
});

describe('isFieldEmailValid', () => {
  it('should return true for valid emails', () => {
    expect(isFieldEmailValid('test@example.com')).toBeTrue();
    expect(isFieldEmailValid('user.name+tag@domain.co')).toBeTrue();
    expect(isFieldEmailValid('user_name@sub.domain.com')).toBeTrue();
    expect(isFieldEmailValid('user-name@domain.org')).toBeTrue();
  });

  it('should return false for invalid emails', () => {
    expect(isFieldEmailValid('test@.com')).toBeFalse();
    expect(isFieldEmailValid('test@com')).toBeFalse();
    expect(isFieldEmailValid('test.com')).toBeFalse();
    expect(isFieldEmailValid('test@domain,com')).toBeFalse();
    expect(isFieldEmailValid('test@domain')).toBeFalse();
    expect(isFieldEmailValid('')).toBeFalse();
  });
});
