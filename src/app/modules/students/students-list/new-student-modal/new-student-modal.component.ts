import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';
import {
  DynamicField,
  FormCreation,
} from '@core/factories/forms/form-factory.interface';
import { Lookup } from '@core/models/lookup';
import { StudentService } from '@core/services/api/student.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import {
  buildStudentErrorToast,
  buildStudentFields,
  buildStudentPayload,
  buildStudentSuccessToast,
  wireStudentForm,
} from '../student-form/student-form';

export interface NewStudentModalData {
  cohorts: Lookup[];
}

/** Creates a student. Editing an existing one is the job of `EditStudentModalComponent`. */
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
  private stateField!: DynamicField;

  constructor(
    public dialogRef: MatDialogRef<NewStudentModalComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: NewStudentModalData
  ) {
    this.unsavedChangesGuard.attach(
      this.dialogRef,
      () => this.form?.dirty ?? false
    );
    const { fields, stateField } = buildStudentFields({
      cohorts: this.data.cohorts,
      getForm: () => this.form,
    });
    this.formFields = fields;
    this.stateField = stateField;
  }

  readonly title = 'New Student';

  get submitLabel(): string {
    return this.isSubmitting ? 'Creating...' : 'Save';
  }

  setFormGroup(event: FormGroup): void {
    this.form = event;
    wireStudentForm(event, this.stateField, () => false);
  }

  requestClose(): void {
    this.unsavedChangesGuard
      .requestClose(this.dialogRef, () => this.form?.dirty ?? false)
      .subscribe();
  }

  submit(): void {
    if (!this.form || this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = buildStudentPayload(this.form, {
      studentId: undefined,
      cohortId: Number(this.form.getRawValue()['cohortId']),
    });

    this.studentService.createManualStudent(payload).subscribe({
      next: response => {
        this.toastService.showToast(buildStudentSuccessToast(response, false));
        this.dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this.toastService.showToast(buildStudentErrorToast(error, false), true);
        console.error(error);
        this.isSubmitting = false;
      },
    });
  }
}
