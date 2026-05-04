import { NgClass } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
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
import { AssessmentModalData } from '@modules/assessments/models/assessments.interfaces';

@Component({
  selector: 'app-edit-assessment-modal',
  imports: [FormFactoryComponent, MatDialogModule, NgClass],
  templateUrl: './edit-assessment-modal.component.html',
  styleUrl: '../../styles/assessments-modal-styles.scss',
})
export class EditAssessmentModalComponent implements FormCreation {
  formInstance = new EventEmitter<FormGroup>();
  formFields: DynamicField[] = [];
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditAssessmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssessmentModalData
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
        name: 'submitter',
        label: 'Submitter',
        placeholder: 'Select submitter',
        options: this.data.profiles,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: this.data.assessment.createdBy,
      },
      {
        type: 'select',
        name: 'service',
        label: 'Service',
        placeholder: 'Select service',
        options: this.data.services,
        validators: [Validators.required],
        floatingLabel: 'always',
        value: this.data.assessment.service,
      },
      {
        type: 'select',
        name: 'professional',
        label: 'Professional',
        placeholder: 'Select a professional',
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
        validators: [],
        floatingLabel: 'always',
        value: this.data.assessment.comments,
      },
    ];
  }

  protected setFormGroup(event: FormGroup) {
    this.form = event;
  }

  protected submitAssessment() {
    console.log('Submitting assessment', this.form.value);
  }
}
