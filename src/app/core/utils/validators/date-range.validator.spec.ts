import { FormControl, FormGroup } from '@angular/forms';
import { dateRangeValidator, yearRangeValidator } from './date-range.validator';

describe('dateRangeValidator', () => {
  function buildGroup(start: unknown, end: unknown): FormGroup {
    return new FormGroup(
      {
        startDate: new FormControl(start),
        endDate: new FormControl(end),
      },
      { validators: dateRangeValidator('startDate', 'endDate') }
    );
  }

  it('should return dateRangeInvalid when endDate is before startDate', () => {
    const group = buildGroup(new Date(2025, 5, 15), new Date(2025, 5, 10));

    expect(group.hasError('dateRangeInvalid')).toBeTrue();
  });

  it('should not return an error when endDate equals startDate', () => {
    const sameDate = new Date(2025, 5, 15);
    const group = buildGroup(sameDate, sameDate);

    expect(group.hasError('dateRangeInvalid')).toBeFalse();
  });

  it('should not return an error when endDate is after startDate', () => {
    const group = buildGroup(new Date(2025, 5, 10), new Date(2025, 5, 15));

    expect(group.hasError('dateRangeInvalid')).toBeFalse();
  });

  it('should return null when startDate is empty', () => {
    const group = buildGroup('', new Date(2025, 5, 15));

    expect(group.hasError('dateRangeInvalid')).toBeFalse();
  });

  it('should return null when endDate is empty', () => {
    const group = buildGroup(new Date(2025, 5, 15), '');

    expect(group.hasError('dateRangeInvalid')).toBeFalse();
  });

  it('should return null when both dates are empty', () => {
    const group = buildGroup('', '');

    expect(group.hasError('dateRangeInvalid')).toBeFalse();
  });

  it('should return null when startDate is an invalid date string', () => {
    const group = buildGroup('not-a-date', new Date(2025, 5, 15));

    expect(group.hasError('dateRangeInvalid')).toBeFalse();
  });

  it('should return null when endDate is an invalid date string', () => {
    const group = buildGroup(new Date(2025, 5, 15), 'not-a-date');

    expect(group.hasError('dateRangeInvalid')).toBeFalse();
  });

  it('should work with custom control names (start/end)', () => {
    const group = new FormGroup(
      {
        start: new FormControl(new Date(2025, 5, 15)),
        end: new FormControl(new Date(2025, 5, 10)),
      },
      { validators: dateRangeValidator('start', 'end') }
    );

    expect(group.hasError('dateRangeInvalid')).toBeTrue();
  });
});

describe('yearRangeValidator', () => {
  it('should return null when value is empty', () => {
    const control = new FormControl('', yearRangeValidator(1900, 2100));

    expect(control.errors).toBeNull();
  });

  it('should return null when the date is invalid', () => {
    const control = new FormControl(
      'not-a-date',
      yearRangeValidator(1900, 2100)
    );

    expect(control.errors).toBeNull();
  });

  it('should return yearOutOfRange when the year is below the minimum', () => {
    const control = new FormControl(
      new Date(1899, 0, 1),
      yearRangeValidator(1900, 2100)
    );

    expect(control.hasError('yearOutOfRange')).toBeTrue();
    expect(control.errors?.['yearOutOfRange']).toEqual({
      min: 1900,
      max: 2100,
    });
  });

  it('should return yearOutOfRange when the year is above the maximum', () => {
    const control = new FormControl(
      new Date(2101, 0, 1),
      yearRangeValidator(1900, 2100)
    );

    expect(control.hasError('yearOutOfRange')).toBeTrue();
  });

  it('should return null when the year is within range', () => {
    const control = new FormControl(
      new Date(2025, 0, 1),
      yearRangeValidator(1900, 2100)
    );

    expect(control.errors).toBeNull();
  });

  it('should return null when the year equals the minimum boundary', () => {
    const control = new FormControl(
      new Date(1900, 0, 1),
      yearRangeValidator(1900, 2100)
    );

    expect(control.errors).toBeNull();
  });

  it('should return null when the year equals the maximum boundary', () => {
    const control = new FormControl(
      new Date(2100, 11, 31),
      yearRangeValidator(1900, 2100)
    );

    expect(control.errors).toBeNull();
  });
});
