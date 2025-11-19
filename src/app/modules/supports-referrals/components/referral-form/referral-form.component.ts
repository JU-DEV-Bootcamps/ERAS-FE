import {
  Component,
  computed,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
  DynamicField,
  FormCreation,
} from '@core/factories/forms/form-factory.interface';
import { FormFactoryComponent } from '@core/factories/forms/form-factory.component';

@Component({
  selector: 'app-referral-form',
  imports: [FormFactoryComponent],
  templateUrl: './referral-form.component.html',
})
export class ReferralFormComponent implements FormCreation {
  @Output() formInstance = new EventEmitter<FormGroup>();

  matDialogData = inject(MAT_DIALOG_DATA);
  lookups = computed(() => this.matDialogData.data);

  formFields: DynamicField[] = [
    { type: 'date', name: 'date', label: 'Date', validators: ['required'] },
    {
      type: 'select',
      name: 'submitter',
      label: 'Submitter',
      validators: ['required'],
      options: this.lookups().profiles,
    },
    {
      type: 'select',
      name: 'service',
      label: 'Service',
      validators: ['required'],
      options: this.lookups().services,
    },
    {
      type: 'select',
      name: 'professional',
      label: 'Professional',
      validators: ['required'],
      options: this.lookups().professionals,
    },
    {
      type: 'select',
      name: 'student',
      label: 'Student',
      multipleSelect: true,
      validators: ['required'],
      options: this.lookups().students,
    },
    { type: 'textarea', name: 'comment', label: 'Professinal comment' },
  ];
}
