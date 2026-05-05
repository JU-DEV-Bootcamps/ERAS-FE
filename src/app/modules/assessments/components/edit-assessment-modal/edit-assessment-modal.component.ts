import { NgClass } from '@angular/common';
import {
  Component,
  EventEmitter,
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
import { areObjectsEqual } from '@core/utils/helpers/are-objects-equal';
import {
  AssessmentModalData,
  EditAssessmentModel,
} from '@modules/assessments/models/assessments.interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-assessment-modal',
  imports: [FormFactoryComponent, MatDialogModule, NgClass],
  templateUrl: './edit-assessment-modal.component.html',
  styleUrl: '../../styles/assessments-modal-styles.scss',
})
export class EditAssessmentModalComponent implements FormCreation, OnDestroy {
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
    };

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
    console.log('Submitting assessment', this.form.value);
  }
}
