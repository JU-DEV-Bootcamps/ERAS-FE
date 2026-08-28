import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  inject,
  Inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';
import {
  DynamicField,
  FormCreation,
} from '@core/factories/forms/form-factory.interface';
import { AssessmentModel } from '@core/models/assessment.model';
import { ToastNotificationData } from '@core/models/toast-notification.model';
import { AssessmentService } from '@core/services/api/assessement.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { areObjectsEqual } from '@core/utils/helpers/are-objects-equal';
import {
  AssessmentModalData,
  EditAssessmentModel,
} from '@modules/assessments/models/assessments.interfaces';
import { Subscription } from 'rxjs';

const STATUS_OPTIONS = [
  {
    value: 'Remitted',
    label: 'Remitted',
    allowed: ['Remitted'],
    colors: {
      label: '#333399',
      background: '#cdcde1',
    },
  },
  {
    value: 'InProgress',
    label: 'InProgress',
    allowed: ['Remitted', 'InProgress'],
    colors: {
      label: '#854d0e',
      background: '#fef9c3',
    },
  },
  {
    value: 'Finalized',
    label: 'Finalized',
    allowed: ['InProgress'],
    colors: {
      label: '#117473',
      background: '#afeae9',
    },
  },
];

@Component({
  selector: 'app-edit-assessment-modal',
  imports: [FormFactoryComponent, MatDialogModule, NgClass],
  templateUrl: './edit-assessment-modal.component.html',
  styleUrl: '../../styles/assessments-modal-styles.scss',
})
export class EditAssessmentModalComponent implements FormCreation, OnDestroy {
  private readonly assessmentsService = inject(AssessmentService);
  private readonly toastService = inject(ToastNotificationService);

  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = [];
  form!: FormGroup;

  private originalAssessment: EditAssessmentModel;
  private valueChangesSubscription!: Subscription;
  protected formHasChanges = signal<boolean>(false);

  constructor(
    public dialogRef: MatDialogRef<EditAssessmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssessmentModalData
  ) {
    this.originalAssessment = {
      date: data.assessment.createdAtUtc,
      professional: data.assessment.assignedProfessional!,
      professionalComment: data.assessment.comments as string | undefined,
      service: data.assessment.service,
      students: data.assessment.studentIds,
      submitter: data.assessment.createdBy,
      status: data.assessment.status,
    };

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
        value: this.data.assessment.studentIds,
      },
      {
        type: 'date',
        name: 'date',
        label: 'Date',
        placeholder: 'Select a date',
        validators: [Validators.required],
        floatingLabel: 'always',
        value: this.data.assessment.createdAtUtc,
      },
      {
        type: 'select',
        name: 'status',
        label: 'Status',
        options: STATUS_OPTIONS.filter(s =>
          s.allowed.includes(data.assessment.status)
        ),
        validators: [Validators.required],
        floatingLabel: 'always',
        selectConfig: {
          displayMode: 'chips',
        },
        value: this.data.assessment.status,
      },
      {
        type: 'select',
        name: 'submitter',
        label: 'Submitter',
        placeholder: 'Select submitter',
        options: this.data.profiles,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: this.data.assessment.createdBy,
      },
      {
        type: 'creatableSelect',
        name: 'service',
        label: 'Service',
        placeholder: 'Search services...',
        options: this.data.services,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: this.data.assessment.service,
      },
      {
        type: 'creatableSelect',
        name: 'professional',
        label: 'Professional',
        placeholder: 'Search professionals...',
        options: this.data.professionals,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: this.data.assessment.assignedProfessional,
      },
      {
        type: 'textarea',
        name: 'professionalComment',
        label: 'Professional comment',
        placeholder: 'Leave a comment',
        validators: this.data.assessment.comments ? [Validators.required] : [],
        floatingLabel: 'always',
        value: this.data.assessment.comments,
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.valueChangesSubscription)
      this.valueChangesSubscription.unsubscribe();
  }

  protected setFormGroup(event: FormGroup) {
    this.form = event;
    this.valueChangesSubscription = this.form.valueChanges.subscribe({
      next: value => {
        this.formHasChanges.set(
          !areObjectsEqual(this.originalAssessment, value)
        );
      },
    });
  }

  protected submitAssessment() {
    if (this.form.valid) {
      const editedAssessment: AssessmentModel = {
        id: this.data.assessment.id,
        createdAtUtc: new Date(this.form.value.date).toISOString(),
        createdBy: this.form.value.submitter,
        service:
          this.form.value.service.value ?? this.originalAssessment.service,
        assignedProfessional:
          this.form.value.professional.value ??
          this.originalAssessment.professional,
        studentIds: this.form.value.students,
        comments: this.form.value.professionalComment,
        status: this.form.value.status,
        interventions: [],
      };
      this.assessmentsService
        .editAssessment(this.data.assessment.id!.toString(), editedAssessment)
        .subscribe({
          next: response => {
            const toastData = this.buildSuccessToastDataObject(response);
            this.toastService.showToast(toastData);
            this.assessmentsService.clearCache();
          },
          error: err => {
            const toastData = this.buildErrorToastDataObject(err);
            this.toastService.showToast(toastData);
            console.error('Error updating assessment', err);
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
        ? `Assessment for ${firstStudent?.label} and other ${totalStudents - 1} students has been updated.`
        : `Assessment for ${firstStudent?.label} has been updated.`;

    return {
      title: 'Assessment updated successfully',
      message: message,
      type: 'success',
    };
  }

  private buildErrorToastDataObject(
    error: HttpErrorResponse
  ): ToastNotificationData {
    const defaultMessage =
      'There was an error submitting the form. Please try again later.';
    const message = `${error.statusText}: ${error.error.message ?? defaultMessage}`;
    return {
      title: 'Form Submission Failed',
      message: message,
      type: 'error',
    };
  }
}
