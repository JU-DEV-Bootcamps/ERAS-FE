import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgClass } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { STUDENT_PROFILE_MESSAGES } from '@core/constants/messages';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';
import {
  DynamicField,
  FormCreation,
} from '@core/factories/forms/form-factory.interface';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { StudentService } from '@core/services/api/student.service';
import { ERASPermissions } from '@core/services/permissions/permission.policies';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { StudentInterventionsComponent } from '../student-interventions/student-interventions.component';
import {
  IMPORTED_LOCKED_FIELDS,
  buildStudentErrorToast,
  buildStudentFields,
  buildStudentPayload,
  buildStudentSuccessToast,
  wireStudentForm,
} from '../student-form/student-form';

export interface EditStudentModalData {
  student: StudentProfileSummaryModel;
}

/**
 * Edits an existing student. It opens editable straight away; a user who cannot
 * manage students sees the same form with every field disabled and can still
 * manage the student's interventions below it.
 */
@Component({
  selector: 'app-edit-student-modal',
  imports: [
    FormFactoryComponent,
    MatDialogModule,
    MatIconModule,
    NgClass,
    StudentInterventionsComponent,
  ],
  templateUrl: './edit-student-modal.component.html',
  styleUrl: '../../../assessments/styles/assessments-modal-styles.scss',
})
export class EditStudentModalComponent implements FormCreation {
  private readonly studentService = inject(StudentService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly unsavedChangesGuard = inject(UnsavedChangesGuardService);
  private readonly dialogRef =
    inject<MatDialogRef<EditStudentModalComponent, boolean>>(MatDialogRef);
  readonly data = inject<EditStudentModalData>(MAT_DIALOG_DATA);

  readonly title = STUDENT_PROFILE_MESSAGES.EDIT_TITLE;
  readonly closeLabel = STUDENT_PROFILE_MESSAGES.CLOSE;
  /** Without it (a Professional) the form is read only and there is no Save. */
  readonly canEdit = inject(PermissionsService).can(
    ERASPermissions.CAN_MANAGE_STUDENTS
  );

  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[];
  form!: FormGroup;
  isSubmitting = false;
  private readonly stateField: DynamicField;

  constructor() {
    this.unsavedChangesGuard.attach(
      this.dialogRef,
      () => this.form?.dirty ?? false
    );
    const { fields, stateField } = buildStudentFields({
      student: this.data.student,
      lockedFields: this.data.student.isImported ? IMPORTED_LOCKED_FIELDS : [],
      getForm: () => this.form,
    });
    this.formFields = fields;
    this.stateField = stateField;
  }

  get submitLabel(): string {
    return this.isSubmitting ? 'Saving...' : 'Save';
  }

  setFormGroup(event: FormGroup): void {
    this.form = event;
    wireStudentForm(event, this.stateField, () => !this.canEdit);
    if (!this.canEdit) event.disable({ emitEvent: false });
  }

  requestClose(): void {
    this.unsavedChangesGuard
      .requestClose(this.dialogRef, () => this.form?.dirty ?? false)
      .subscribe();
  }

  submit(): void {
    if (!this.canEdit || !this.form || this.form.invalid || this.isSubmitting)
      return;
    this.isSubmitting = true;

    const payload = buildStudentPayload(this.form, {
      studentId: this.data.student.studentId,
      cohortId: null,
    });

    this.studentService
      .updateStudentProfile(this.data.student.studentId!, payload)
      .subscribe({
        next: response => {
          this.toastService.showToast(buildStudentSuccessToast(response, true));
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this.toastService.showToast(
            buildStudentErrorToast(error, true),
            true
          );
          console.error(error);
          this.isSubmitting = false;
        },
      });
  }
}
