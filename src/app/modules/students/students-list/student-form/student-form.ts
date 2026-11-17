import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DynamicField } from '@core/factories/forms/form-factory.interface';
import { Lookup } from '@core/models/lookup';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { StudentRegistrationModel } from '@core/models/student-registration.model';
import { ToastNotificationData } from '@core/models/toast-notification.model';
import {
  COUNTRY_OPTIONS,
  getRegionOptions,
  withCurrentValue,
} from '@core/utils/geo/geo-data';

/**
 * What the "New Student" and "Edit Student Profile" modals share: the field
 * definitions, validators, payload and toasts, so both forms stay identical.
 */

const NAME_PATTERN = /^[\p{L}][\p{L}'\-.\s]*$/u;
const ID_PASSPORT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\-\s]*$/;
const PHONE_PATTERN = /^\+?[0-9\s\-()]{6,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENDER_OPTIONS: Lookup[] = [
  { label: 'Female', value: 'Female' },
  { label: 'Male', value: 'Male' },
  { label: 'Non-binary', value: 'Non-binary' },
  { label: 'Prefer not to say', value: 'Prefer not to say' },
];

const LEVEL_OF_STUDY_OPTIONS: Lookup[] = [
  { label: 'Associate', value: 'Associate' },
  { label: 'Bachelor', value: 'Bachelor' },
  { label: 'Master', value: 'Master' },
  { label: 'Doctorate', value: 'Doctorate' },
];

const STUDY_MODALITY_OPTIONS: Lookup[] = [
  { label: 'On-site', value: 'On-site' },
  { label: 'Online', value: 'Online' },
  { label: 'Hybrid', value: 'Hybrid' },
];

/** Names of the fields an imported student cannot change. */
export const IMPORTED_LOCKED_FIELDS = [
  'firstName',
  'middleName',
  'lastName',
  'primaryEmail',
];

export interface StudentFieldsOptions {
  /** The student being edited; absent when creating. */
  student?: StudentProfileSummaryModel;
  /** Cohort options; only the creation form has the cohort field. */
  cohorts?: Lookup[];
  lockedFields?: string[];
  /** Gives the form once it exists, for the "different from primary email" check. */
  getForm: () => FormGroup | undefined;
}

export interface StudentFields {
  fields: DynamicField[];
  stateField: DynamicField;
}

const notBlank: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null =>
  typeof control.value === 'string' &&
  control.value.length > 0 &&
  control.value.trim().length === 0
    ? { required: true }
    : null;

function differentFromPrimaryEmail(
  getForm: () => FormGroup | undefined
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const secondary = String(control.value ?? '')
      .trim()
      .toLowerCase();
    const primary = String(getForm()?.get('primaryEmail')?.value ?? '')
      .trim()
      .toLowerCase();
    return secondary && secondary === primary ? { sameAsPrimary: true } : null;
  };
}

export function buildStudentFields(
  options: StudentFieldsOptions
): StudentFields {
  const { student, cohorts } = options;
  const locked = options.lockedFields ?? [];
  const text = (value?: string | null) => value ?? '';
  const requiredText = (max: number, pattern?: RegExp): ValidatorFn[] => [
    Validators.required,
    notBlank,
    Validators.maxLength(max),
    ...(pattern ? [Validators.pattern(pattern)] : []),
  ];
  const optionalText = (max: number, pattern?: RegExp): ValidatorFn[] => [
    Validators.maxLength(max),
    ...(pattern ? [Validators.pattern(pattern)] : []),
  ];
  const common = { floatingLabel: 'always' } as const;
  const lockedName = (name: string) => locked.includes(name);

  const personal: DynamicField[] = [
    {
      type: 'text',
      name: 'firstName',
      label: 'First Name',
      placeholder: 'Enter first name',
      validators: requiredText(100, NAME_PATTERN),
      value: text(student?.firstName),
      disabled: lockedName('firstName'),
      ...common,
    },
    {
      type: 'text',
      name: 'middleName',
      label: 'Middle Name',
      placeholder: 'Enter middle name',
      validators: optionalText(100, NAME_PATTERN),
      value: text(student?.middleName),
      disabled: lockedName('middleName'),
      ...common,
    },
    {
      type: 'text',
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter last name',
      validators: requiredText(100, NAME_PATTERN),
      value: text(student?.lastName),
      disabled: lockedName('lastName'),
      ...common,
    },
    {
      type: 'date',
      name: 'dateOfBirth',
      label: 'Date of Birth',
      placeholder: 'Select a date',
      validators: ['futureDate'],
      value: parseDate(student?.dateOfBirth),
      ...common,
    },
    {
      type: 'select',
      name: 'gender',
      label: 'Gender',
      placeholder: 'Select gender',
      options: GENDER_OPTIONS,
      value: text(student?.gender),
      ...common,
    },
    {
      type: 'select',
      name: 'nationality',
      label: 'Nationality/Citizenship',
      placeholder: 'Select nationality',
      options: withCurrentValue(COUNTRY_OPTIONS, student?.nationality),
      value: text(student?.nationality),
      ...common,
    },
    {
      type: 'select',
      name: 'countryOfBirth',
      label: 'Country of Birth',
      placeholder: 'Select country of birth',
      options: withCurrentValue(COUNTRY_OPTIONS, student?.countryOfBirth),
      value: text(student?.countryOfBirth),
      ...common,
    },
    {
      type: 'text',
      name: 'idPassportNumber',
      label: 'ID/Passport Number',
      placeholder: 'Enter ID or passport number',
      validators: requiredText(50, ID_PASSPORT_PATTERN),
      value: text(student?.idPassportNumber),
      ...common,
    },
  ];

  const stateField: DynamicField = {
    type: 'select',
    name: 'stateProvince',
    label: 'State/Province',
    placeholder: 'Select state or province',
    options: withCurrentValue(
      getRegionOptions(student?.country),
      student?.stateProvince
    ),
    value: text(student?.stateProvince),
    ...common,
  };

  const contact: DynamicField[] = [
    {
      type: 'text',
      name: 'primaryEmail',
      label: 'Primary Email',
      placeholder: 'name@example.com',
      validators: [
        Validators.required,
        notBlank,
        Validators.maxLength(255),
        Validators.pattern(EMAIL_PATTERN),
      ],
      value: text(student?.primaryEmail),
      disabled: lockedName('primaryEmail'),
      ...common,
    },
    {
      type: 'text',
      name: 'secondaryEmail',
      label: 'Secondary Email (Optional)',
      placeholder: 'name@example.com',
      validators: [
        Validators.maxLength(255),
        Validators.pattern(EMAIL_PATTERN),
        differentFromPrimaryEmail(options.getForm),
      ],
      value: text(student?.secondaryEmail),
      ...common,
    },
    {
      type: 'text',
      name: 'mobileNumber',
      label: 'Mobile No.',
      placeholder: '+1 555 123 4567',
      validators: optionalText(20, PHONE_PATTERN),
      value: text(student?.mobileNumber),
      ...common,
    },
    {
      type: 'select',
      name: 'country',
      label: 'Country',
      placeholder: 'Select country',
      options: withCurrentValue(COUNTRY_OPTIONS, student?.country),
      value: text(student?.country),
      ...common,
    },
    stateField,
    {
      type: 'text',
      name: 'city',
      label: 'City',
      placeholder: 'Enter city',
      validators: optionalText(100),
      value: text(student?.city),
      ...common,
    },
    {
      type: 'text',
      name: 'street',
      label: 'Street',
      placeholder: 'Enter street',
      validators: optionalText(200),
      value: text(student?.street),
      ...common,
    },
    {
      type: 'text',
      name: 'postalCode',
      label: 'Postal Code',
      placeholder: 'Enter postal code',
      validators: optionalText(20),
      value: text(student?.postalCode),
      ...common,
    },
  ];

  const academic: DynamicField[] = [
    ...(cohorts
      ? [
          {
            type: 'select',
            name: 'cohortId',
            label: 'Cohort',
            placeholder: 'Select cohort',
            options: cohorts,
            validators: [Validators.required],
            ...common,
          } as DynamicField,
        ]
      : []),
    {
      type: 'select',
      name: 'levelOfStudy',
      label: 'Level of study',
      placeholder: 'Select level of study',
      options: LEVEL_OF_STUDY_OPTIONS,
      value: text(student?.levelOfStudy),
      ...common,
    },
    {
      type: 'text',
      name: 'facultySchool',
      label: 'Faculty/School',
      placeholder: 'Enter faculty or school',
      validators: optionalText(150),
      value: text(student?.facultySchool),
      ...common,
    },
    {
      type: 'select',
      name: 'studyModality',
      label: 'Study modality',
      placeholder: 'Select study modality',
      options: STUDY_MODALITY_OPTIONS,
      value: text(student?.studyModality),
      ...common,
    },
    {
      type: 'text',
      name: 'previousInstitution',
      label: 'Previous Institution',
      placeholder: 'Enter previous institution',
      validators: optionalText(200),
      value: text(student?.previousInstitution),
      ...common,
    },
  ];

  return { fields: [...personal, ...contact, ...academic], stateField };
}

/**
 * Keeps the state/province options tied to the chosen country. The state control
 * is disabled while the country has no regions, unless `keepDisabled` (the whole
 * form is read only, or the field is locked).
 */
export function syncStateOptions(
  form: FormGroup,
  stateField: DynamicField,
  country: string,
  clearSelection: boolean,
  keepDisabled: boolean
): void {
  const control = form.get('stateProvince');
  const regions = getRegionOptions(country);
  const current = clearSelection ? null : (control?.value as string);

  stateField.options = withCurrentValue(regions, current);
  if (clearSelection) control?.setValue('', { emitEvent: false });

  if (keepDisabled) return;
  if (stateField.options.length === 0) {
    control?.disable({ emitEvent: false });
  } else if (control?.disabled) {
    control.enable({ emitEvent: false });
  }
}

/** Wires what both forms need once the form exists. */
export function wireStudentForm(
  form: FormGroup,
  stateField: DynamicField,
  keepStateDisabled: () => boolean
): void {
  form.get('primaryEmail')?.valueChanges.subscribe(() => {
    form.get('secondaryEmail')?.updateValueAndValidity();
  });
  form.get('country')?.valueChanges.subscribe(country => {
    syncStateOptions(
      form,
      stateField,
      country as string,
      true,
      keepStateDisabled()
    );
  });
  syncStateOptions(
    form,
    stateField,
    form.get('country')?.value as string,
    false,
    keepStateDisabled()
  );
}

export function buildStudentPayload(
  form: FormGroup,
  base: Pick<StudentRegistrationModel, 'studentId' | 'cohortId'>
): StudentRegistrationModel {
  const raw = form.getRawValue() as Record<string, unknown>;
  const clean = (key: string): string | null => {
    const value = raw[key];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    studentId: base.studentId,
    cohortId: base.cohortId,
    firstName: clean('firstName') ?? '',
    middleName: clean('middleName'),
    lastName: clean('lastName') ?? '',
    dateOfBirth: formatDate(raw['dateOfBirth']),
    gender: clean('gender'),
    nationality: clean('nationality'),
    countryOfBirth: clean('countryOfBirth'),
    idPassportNumber: clean('idPassportNumber') ?? '',
    primaryEmail: clean('primaryEmail') ?? '',
    secondaryEmail: clean('secondaryEmail'),
    mobileNumber: clean('mobileNumber'),
    country: clean('country'),
    stateProvince: clean('stateProvince'),
    city: clean('city'),
    street: clean('street'),
    postalCode: clean('postalCode'),
    levelOfStudy: clean('levelOfStudy'),
    facultySchool: clean('facultySchool'),
    studyModality: clean('studyModality'),
    previousInstitution: clean('previousInstitution'),
  };
}

export function buildStudentSuccessToast(
  response: StudentRegistrationModel,
  isEditing: boolean
): ToastNotificationData {
  const fullName = [response.firstName, response.lastName]
    .filter(Boolean)
    .join(' ');
  return {
    title: isEditing
      ? 'Student updated successfully'
      : 'Student created successfully',
    message: isEditing
      ? `${fullName} has been updated.`
      : `${fullName} has been added.`,
    type: 'success',
  };
}

export function buildStudentErrorToast(
  error: HttpErrorResponse,
  isEditing: boolean
): ToastNotificationData {
  const defaultMessage =
    'There was an error submitting the form. Please try again later.';
  const body = error.error;
  const detail =
    typeof body === 'string' && body.trim().length > 0
      ? body
      : (body?.title ?? defaultMessage);
  return {
    title: isEditing ? 'Update Failed' : 'Student Creation Failed',
    message: detail,
    type: 'error',
  };
}

function formatDate(value: unknown): string | null {
  if (!(value instanceof Date) || isNaN(value.getTime())) return null;
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

function parseDate(value?: string | null): Date | string {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
