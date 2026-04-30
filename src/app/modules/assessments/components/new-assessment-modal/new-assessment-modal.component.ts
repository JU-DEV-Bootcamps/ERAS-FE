import { NgClass } from '@angular/common';
import { Component, EventEmitter, inject, Inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
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
} from '@core/models/assessement.model';
import { AssessmentService } from '@core/services/api/assessement.service';
import { AssessmentsLookups } from '@modules/assessments/models/assessments.interfaces';

@Component({
  selector: 'app-new-assessment-modal',
  imports: [FormFactoryComponent, MatDialogModule, NgClass],
  templateUrl: './new-assessment-modal.component.html',
  styleUrl: './new-assessment-modal.component.scss',
})
export class NewAssessmentModalComponent implements FormCreation {
  private readonly assessmentsService = inject(AssessmentService);
  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = [];
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NewAssessmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssessmentsLookups
  ) {
    this.formFields = [
      {
        type: 'select',
        name: 'students',
        label: 'Students',
        placeholder: 'Select students',
        options: this.data.students,
        validators: [Validators.required],
        multipleSelect: true,
        floatingLabel: 'always',
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
      },
      {
        type: 'select',
        name: 'service',
        label: 'Service',
        placeholder: 'Select service',
        options: this.data.services,
        validators: [Validators.required],
        floatingLabel: 'always',
      },
      {
        type: 'select',
        name: 'professional',
        label: 'Professional',
        placeholder: 'Select a professional',
        options: this.data.professionals,
        validators: [Validators.required],
        floatingLabel: 'always',
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

  setFormGroup(event: FormGroup) {
    this.form = event;
  }

  submitAssessment() {
    if (this.form.valid) {
      const newAssessment: AssessmentModel = {
        createdAtUtc: new Date().toISOString(),
        createdBy: this.form.value.submitter,
        service: this.form.value.service,
        assignedProfessional: this.form.value.professional,
        studentIds: this.form.value.students,
        comments: this.form.value.professionalComment,
        status: AssessmentStatus.Created,
        interventions: [],
      };

      this.assessmentsService.createAssessment(newAssessment).subscribe({
        next: response => {
          console.log('Success', response);
          this.assessmentsService.clearCache();
          this.assessmentsService.getAll();
        },
        error: err => console.log('Error', err),
        complete: () => {
          this.dialogRef.close();
        },
      });
    }
  }
}
