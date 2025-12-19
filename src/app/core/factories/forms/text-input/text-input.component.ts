import { Component, input } from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { DynamicField, DynamicInputComponent } from '../form-factory.interface';
import { FormUtils } from '@core/utils/forms/form-utils';

@Component({
  selector: 'app-text-input',
  imports: [MatInputModule, ReactiveFormsModule],
  templateUrl: './text-input.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class TextInputComponent implements DynamicInputComponent {
  field = input.required<DynamicField>();
  form = input.required<FormGroup>();
  formUtils = FormUtils;
}
