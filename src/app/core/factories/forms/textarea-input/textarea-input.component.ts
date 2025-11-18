import { Component, input } from '@angular/core';
import { DynamicField, DynamicInputComponent } from '../form-factory.interface';
import {
  ControlContainer,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormUtils } from '@core/utils/forms/form-utils';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-textarea-input',
  imports: [MatInputModule, ReactiveFormsModule],
  templateUrl: './textarea-input.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class TextareaInputComponent implements DynamicInputComponent {
  field = input.required<DynamicField>();
  form = input.required<FormGroup>();
  formUtils = FormUtils;
}
