import { Component, input } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import {
  ControlContainer,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';

import { DynamicField, DynamicInputComponent } from '../form-factory.interface';
import { FormUtils } from '@core/utils/forms/form-utils';

@Component({
  selector: 'app-number-input',
  imports: [MatInputModule, ReactiveFormsModule],
  templateUrl: './number-input.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class NumberInputComponent implements DynamicInputComponent {
  field = input.required<DynamicField>();
  form = input.required<FormGroup>();
  formUtils = FormUtils;
}
