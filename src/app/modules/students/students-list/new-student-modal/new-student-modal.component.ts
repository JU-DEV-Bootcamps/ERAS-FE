import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Inject } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';
import {
  DynamicField,
  FormCreation,
} from '@core/factories/forms/form-factory.interface';
import { Lookup } from '@core/models/lookup';
import { StudentRegistrationModel } from '@core/models/student-registration.model';
import { ToastNotificationData } from '@core/models/toast-notification.model';
import {
  COUNTRY_OPTIONS,
  getRegionOptions,
  withCurrentValue,
} from '@core/utils/geo/geo-data';
import { StudentService } from '@core/services/api/student.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';

export interface NewStudentModalData {
  cohorts: Lookup[];
  student?: StudentRegistrationModel;
  hasProfile?: boolean;
}

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

@Component({
  selector: 'app-new-student-modal',
  imports: [FormFactoryComponent, MatDialogModule, MatIconModule, NgClass],
  templateUrl: './new-student-modal.component.html',
  styleUrl: '../../../assessments/styles/assessments-modal-styles.scss',
})
export class NewStudentModalComponent implements FormCreation {
  private readonly studentService = inject(StudentService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly unsavedChangesGuard = inject(UnsavedChangesGuardService);

  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = [];
  form!: FormGroup;
  isSubmitting = false;
  readonly isEditing: boolean;
  isViewing: boolean;
  private readonly opensEditable: boolean;
  private stateField!: DynamicField;

  constructor(
    public dialogRef: MatDialogRef<NewStudentModalComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: NewStudentModalData
  ) {
    this.isEditing = !!this.data.student?.studentId;
    this.opensEditable = this.isEditing && this.data.hasProfile === false;
    this.isViewing = this.isEditing && !this.opensEditable;
    this.unsavedChangesGuard.attach(
      this.dialogRef,
      () => this.form?.dirty ?? false
    );
    this.formFields = this.buildFields();
  }

  private get lockedFieldNames(): string[] {
    return this.data.student?.isImported
      ? ['firstName', 'middleName', 'lastName', 'primaryEmail']
      : [];
  }

  get title(): string {
    if (!this.isEditing) return 'New Student';
    return this.isViewing ? 'Student Profile' : 'Edit Student';
  }

  get submitLabel(): string {
    if (this.isSubmitting) return this.isEditing ? 'Saving...' : 'Creating...';
    return 'Save';
  }

  setFormGroup(event: FormGroup): void {
    this.form = event;
    event.get('primaryEmail')?.valueChanges.subscribe(() => {
      event.get('secondaryEmail')?.updateValueAndValidity();
    });
    event.get('country')?.valueChanges.subscribe(country => {
      this.syncStateOptions(country as string, true);
    });
    if (this.isViewing) {
      event.disable({ emitEvent: false });
    } else {
      this.syncStateOptions(event.get('country')?.value as string, false);
    }
  }

  private syncStateOptions(country: string, clearSelection: boolean): void {
    const control = this.form.get('stateProvince');
    const regions = getRegionOptions(country);
    const current = clearSelection ? null : (control?.value as string);

    this.stateField.options = withCurrentValue(regions, current);
    if (clearSelection) control?.setValue('', { emitEvent: false });

    if (this.isViewing) return;
    if (this.stateField.options.length === 0) {
      control?.disable({ emitEvent: false });
    } else if (
      control?.disabled &&
      !this.lockedFieldNames.includes('stateProvince')
    ) {
      control.enable({ emitEvent: false });
    }
  }

  startEditing(): void {
    if (!this.isViewing) return;
    this.isViewing = false;
    this.form.enable({ emitEvent: false });
    this.lockedFieldNames.forEach(name =>
      this.form.get(name)?.disable({ emitEvent: false })
    );
    this.syncStateOptions(this.form.get('country')?.value as string, false);
  }

  cancelEditing(): void {
    if (this.opensEditable || this.form.dirty) {
      this.requestClose();
      return;
    }
    this.isViewing = true;
    this.form.disable({ emitEvent: false });
  }

  requestClose(): void {
    this.unsavedChangesGuard
      .requestClose(this.dialogRef, () => this.form?.dirty ?? false)
      .subscribe();
  }

  submit(): void {
    if (!this.form || this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = this.buildPayload();
    const request$ = this.isEditing
      ? this.studentService.updateStudentProfile(
          this.data.student!.studentId!,
          payload
        )
      : this.studentService.createManualStudent(payload);

    request$.subscribe({
      next: response => {
        this.toastService.showToast(this.buildSuccessToast(response));
        this.dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this.toastService.showToast(this.buildErrorToast(error), true);
        console.error(error);
        this.isSubmitting = false;
      },
    });
  }

  private buildFields(): DynamicField[] {
    const student = this.data.student;
    const text = (value?: string | null) => value ?? '';
    const requiredText = (max: number, pattern?: RegExp): ValidatorFn[] => [
      Validators.required,
      this.notBlank,
      Validators.maxLength(max),
      ...(pattern ? [Validators.pattern(pattern)] : []),
    ];
    const optionalText = (max: number, pattern?: RegExp): ValidatorFn[] => [
      Validators.maxLength(max),
      ...(pattern ? [Validators.pattern(pattern)] : []),
    ];
    const common = { floatingLabel: 'always' } as const;
    const primaryEmailLocked = this.lockedFieldNames.includes('primaryEmail');
    const lockedName = (name: string) => this.lockedFieldNames.includes(name);

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
        value: this.parseDate(student?.dateOfBirth),
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

    this.stateField = {
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
          this.notBlank,
          Validators.maxLength(255),
          Validators.pattern(EMAIL_PATTERN),
        ],
        value: text(student?.primaryEmail),
        disabled: primaryEmailLocked,
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
          this.differentFromPrimaryEmail,
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
      this.stateField,
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
      ...(this.isEditing
        ? []
        : [
            {
              type: 'select',
              name: 'cohortId',
              label: 'Cohort',
              placeholder: 'Select cohort',
              options: this.data.cohorts,
              validators: [Validators.required],
              ...common,
            } as DynamicField,
          ]),
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

    return [...personal, ...contact, ...academic];
  }

  private readonly notBlank: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null =>
    typeof control.value === 'string' &&
    control.value.length > 0 &&
    control.value.trim().length === 0
      ? { required: true }
      : null;

  private readonly differentFromPrimaryEmail: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const secondary = String(control.value ?? '')
      .trim()
      .toLowerCase();
    const primary = String(this.form?.get('primaryEmail')?.value ?? '')
      .trim()
      .toLowerCase();
    return secondary && secondary === primary ? { sameAsPrimary: true } : null;
  };

  private buildPayload(): StudentRegistrationModel {
    const raw = this.form.getRawValue() as Record<string, unknown>;
    const clean = (key: string): string | null => {
      const value = raw[key];
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    return {
      studentId: this.data.student?.studentId,
      cohortId: this.isEditing ? null : Number(raw['cohortId']),
      firstName: clean('firstName') ?? '',
      middleName: clean('middleName'),
      lastName: clean('lastName') ?? '',
      dateOfBirth: this.formatDate(raw['dateOfBirth']),
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

  private formatDate(value: unknown): string | null {
    if (!(value instanceof Date) || isNaN(value.getTime())) return null;
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${value.getFullYear()}-${month}-${day}`;
  }

  private parseDate(value?: string | null): Date | string {
    if (!value) return '';
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private buildSuccessToast(
    response: StudentRegistrationModel
  ): ToastNotificationData {
    const fullName = [response.firstName, response.lastName]
      .filter(Boolean)
      .join(' ');
    return {
      title: this.isEditing
        ? 'Student updated successfully'
        : 'Student created successfully',
      message: this.isEditing
        ? `${fullName} has been updated.`
        : `${fullName} has been added.`,
      type: 'success',
    };
  }

  private buildErrorToast(error: HttpErrorResponse): ToastNotificationData {
    const defaultMessage =
      'There was an error submitting the form. Please try again later.';
    const body = error.error;
    const detail =
      typeof body === 'string' && body.trim().length > 0
        ? body
        : (body?.title ?? defaultMessage);
    return {
      title: this.isEditing ? 'Update Failed' : 'Student Creation Failed',
      message: detail,
      type: 'error',
    };
  }
}
