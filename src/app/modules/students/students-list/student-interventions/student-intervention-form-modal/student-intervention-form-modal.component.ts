import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  EventEmitter,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

import {
  STUDENT_INTERVENTION_DESCRIPTION_MAX_LENGTH,
  studentInterventionTypeOptions,
} from '@core/constants/student-intervention.constants';
import { STUDENT_INTERVENTION_MESSAGES } from '@core/constants/messages';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';
import {
  DynamicField,
  FormCreation,
} from '@core/factories/forms/form-factory.interface';
import {
  SaveStudentInterventionModel,
  StudentInterventionKind,
  StudentInterventionModel,
} from '@core/models/student-intervention.model';
import { ToastNotificationData } from '@core/models/toast-notification.model';
import { StudentInterventionService } from '@core/services/api/student-intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';

export interface StudentInterventionFormDialogData {
  studentId: number;
  kind: StudentInterventionKind;
  /** Present when editing; the dialog then closes with the updated entry. */
  entry?: StudentInterventionModel;
}

/** A whitespace-only text counts as empty, so it reports the same "required" error. */
const notBlank: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null =>
  typeof control.value === 'string' &&
  control.value.length > 0 &&
  control.value.trim().length === 0
    ? { required: true }
    : null;

@Component({
  selector: 'app-student-intervention-form-modal',
  imports: [FormFactoryComponent, MatDialogModule, MatIconModule, NgClass],
  templateUrl: './student-intervention-form-modal.component.html',
  styleUrl: '../../../../assessments/styles/assessments-modal-styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentInterventionFormModalComponent implements FormCreation {
  private readonly service = inject(StudentInterventionService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly unsavedChangesGuard = inject(UnsavedChangesGuardService);
  private readonly dialogRef = inject(
    MatDialogRef<StudentInterventionFormModalComponent>
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly data = inject<StudentInterventionFormDialogData>(MAT_DIALOG_DATA);

  readonly messages = STUDENT_INTERVENTION_MESSAGES;
  readonly isSubmitting = signal(false);
  readonly submitLabel = computed(() =>
    this.isSubmitting() ? this.messages.SAVING : this.messages.SAVE
  );

  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = this.buildFields();
  form!: FormGroup;

  constructor() {
    this.unsavedChangesGuard.attach(
      this.dialogRef,
      () => this.form?.dirty ?? false
    );
  }

  get title(): string {
    const isRisk = this.data.kind === 'RiskIdentified';
    if (this.data.entry) {
      return isRisk
        ? this.messages.EDIT_RISK_TITLE
        : this.messages.EDIT_SUPPORT_TITLE;
    }
    return isRisk
      ? this.messages.ADD_RISK_TITLE
      : this.messages.ADD_SUPPORT_TITLE;
  }

  setFormGroup(form: FormGroup): void {
    this.form = form;
  }

  requestClose(): void {
    this.unsavedChangesGuard
      .requestClose(this.dialogRef, () => this.form?.dirty ?? false)
      .subscribe();
  }

  submit(): void {
    if (this.isSubmitting()) return;
    if (!this.form || this.form.invalid) {
      this.form?.markAllAsTouched();
      this.changeDetector.markForCheck();
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.buildPayload();
    const request$ = this.data.entry
      ? this.service.update(this.data.studentId, this.data.entry.id, payload)
      : this.service.create(this.data.studentId, payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: saved => {
        this.toastService.showToast(this.successToast());
        this.dialogRef.close(saved);
      },
      error: (error: HttpErrorResponse) => {
        this.toastService.showToast(this.errorToast(), true);
        console.error(error);
        this.isSubmitting.set(false);
      },
    });
  }

  private buildFields(): DynamicField[] {
    const entry = this.data.entry;
    const common = { floatingLabel: 'always' } as const;
    return [
      {
        type: 'select',
        name: 'type',
        label: this.messages.FIELD_TYPE,
        placeholder: this.messages.SELECT_TYPE,
        options: studentInterventionTypeOptions(this.data.kind),
        value: entry?.type ?? '',
        validators: [Validators.required],
        ...common,
      },
      {
        type: 'date',
        name: 'entryDate',
        label: this.messages.FIELD_DATE,
        value: this.parseDate(entry?.entryDate),
        validators: [Validators.required],
        ...common,
      },
      {
        type: 'textarea',
        name: 'description',
        label: this.messages.FIELD_DESCRIPTION,
        value: entry?.description ?? '',
        validators: [
          Validators.required,
          notBlank,
          Validators.maxLength(STUDENT_INTERVENTION_DESCRIPTION_MAX_LENGTH),
        ],
        ...common,
      },
    ];
  }

  private buildPayload(): SaveStudentInterventionModel {
    const raw = this.form.getRawValue() as Record<string, unknown>;
    return {
      kind: this.data.entry?.kind ?? this.data.kind,
      type: raw['type'] as SaveStudentInterventionModel['type'],
      description: String(raw['description']).trim(),
      entryDate: this.formatDate(raw['entryDate']) ?? '',
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

  private successToast(): ToastNotificationData {
    return {
      title: this.title,
      message: this.messages.SAVE_SUCCESS,
      type: 'success',
    };
  }

  private errorToast(): ToastNotificationData {
    return {
      title: this.title,
      message: this.messages.SAVE_ERROR,
      type: 'error',
    };
  }
}
