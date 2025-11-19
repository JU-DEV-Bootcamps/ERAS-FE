import { Component, input } from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DynamicField, DynamicInputComponent } from '../form-factory.interface';
import { FormUtils } from '@core/utils/forms/form-utils';

@Component({
  selector: 'app-select-input',
  imports: [MatInputModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './select-input.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class SelectInputComponent implements DynamicInputComponent {
  field = input.required<DynamicField>();
  form = input.required<FormGroup>();
  formUtils = FormUtils;
}
