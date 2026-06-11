import { Component, input, signal } from '@angular/core';
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
  selector: 'app-upload-input',
  imports: [MatInputModule, ReactiveFormsModule],
  templateUrl: './upload-input.component.html',
  styleUrl: './upload-input.component.scss',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class UploadInputComponent implements DynamicInputComponent {
  field = input.required<DynamicField>();
  form = input.required<FormGroup>();
  formUtils = FormUtils;

  fileNames = signal<string[]>(['']);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileNames.update(fileNamesPrev => [...fileNamesPrev, file.name]);
    this.form().get(this.field().name)?.setValue(file);
    this.form().get(this.field().name)?.markAsDirty();
  }
}
