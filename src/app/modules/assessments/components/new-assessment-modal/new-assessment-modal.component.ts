import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';
import {
  DynamicField,
  FormCreation,
} from '@core/factories/forms/form-factory.interface';
import {
  AssessmentModel,
  AssessmentStatus,
} from '@core/models/assessment.model';
import { ToastNotificationData } from '@core/models/toast-notification.model';
import { AssessmentService } from '@core/services/api/assessement.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { AssessmentsLookups } from '@modules/assessments/models/assessments.interfaces';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';

@Component({
  selector: 'app-new-assessment-modal',
  imports: [FormFactoryComponent, MatDialogModule, MatIconModule, NgClass],
  templateUrl: './new-assessment-modal.component.html',
  styleUrl: '../../styles/assessments-modal-styles.scss',
})
export class NewAssessmentModalComponent implements FormCreation {
  private readonly assessmentsService = inject(AssessmentService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly unsavedChangesGuard = inject(UnsavedChangesGuardService);

  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = [];
  form!: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<NewAssessmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssessmentsLookups
  ) {
    this.unsavedChangesGuard.attach(
      this.dialogRef,
      () => this.form?.dirty ?? false
    );

    this.formFields = [
      {
        type: 'searchableSelect',
        name: 'students',
        label: 'Students',
        placeholder: 'Select students',
        options: this.data.students,
        validators: [Validators.required],
        multipleSelect: true,
        floatingLabel: 'always',
        value: this.data.preselectedStudentId
          ? [this.data.preselectedStudentId]
          : [],
      },
      {
        type: 'date',
        name: 'date',
        label: 'Date',
        placeholder: 'Select a date',
        validators: [Validators.required],
        floatingLabel: 'always',
      },
      {
        type: 'select',
        name: 'submitter',
        label: 'Submitter',
        placeholder: 'Select submitter',
        options: this.data.profiles,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: this.data.profiles?.[0]?.value ?? null,
      },
      {
        type: 'creatableSelect',
        name: 'service',
        label: 'Service',
        placeholder: 'Search services...',
        options: this.data.services,
        validators: [Validators.required],
        floatingLabel: 'always',
        selectConfig: {
          onCreateRecord: this.data.createService,
        },
      },
      {
        type: 'creatableSelect',
        name: 'professional',
        label: 'Professional',
        placeholder: 'Search professionals...',
        options: this.data.professionals,
        validators: [Validators.required],
        floatingLabel: 'always',
        selectConfig: {
          onCreateRecord: this.data.createProfessional,
        },
      },
      {
        type: 'textarea',
        name: 'professionalComment',
        label: 'Professional comment',
        placeholder: 'Leave a comment',
        validators: [],
        floatingLabel: 'always',
      },
    ];
  }

  closeAndResetDialog() {
    this.dialogRef.close();
  }

  requestClose(): void {
    this.unsavedChangesGuard
      .requestClose(this.dialogRef, () => this.form?.dirty ?? false)
      .subscribe();
  }

  setFormGroup(event: FormGroup) {
    this.form = event;
  }

  submitAssessment() {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const newAssessment: AssessmentModel = {
        createdAtUtc: new Date(this.form.value.date).toISOString(),
        createdBy: this.form.value.submitter,
        service: this.form.value.service,
        assignedProfessional: this.form.value.professional,
        studentIds: this.form.value.students,
        comments: this.form.value.professionalComment,
        status: AssessmentStatus.Remitted,
        interventions: [],
      };

      this.assessmentsService.createAssessment(newAssessment).subscribe({
        next: response => {
          const toastData = this.buildSuccessToastDataObject(response);
          this.toastService.showToast(toastData);
          this.assessmentsService.clearCache();
        },
        error: err => {
          const toastData = this.buildErrorToastDataObject(err);
          this.toastService.showToast(toastData, true);
          console.error(err);
          this.isSubmitting = false;
        },
        complete: () => {
          this.dialogRef.close();
        },
      });
    }
  }

  private buildSuccessToastDataObject(
    response: AssessmentModel
  ): ToastNotificationData {
    const totalStudents: number = response.studentIds.length;
    const firstStudent = this.data.students.find(
      student => student.value === response.studentIds[0]
    );

    const message =
      totalStudents > 1
        ? `Assessment for ${firstStudent?.label} and other ${totalStudents - 1} students has been created.`
        : `Assessment for ${firstStudent?.label} has been created.`;

    return {
      title: 'Assessment created successfully',
      message: message,
      type: 'success',
    };
  }

  private buildErrorToastDataObject(
    error: HttpErrorResponse
  ): ToastNotificationData {
    const defaultMessage =
      'There was an error submitting the form. Please try again later.';
    const message = `${error.statusText}: ${error.error.title ?? defaultMessage}`;
    return {
      title: 'Form Submission Failed',
      message: message,
      type: 'error',
    };
  }
}
