import { Component, input, linkedSignal, signal, OnInit } from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {
  DynamicField,
  DynamicInputComponent,
  FileFieldConfig,
} from '../form-factory.interface';
import { FormUtils } from '@core/utils/forms/form-utils';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FileErrorStateMatcher } from '@core/factories/errors/file-error-state-matcher.component';

@Component({
  standalone: true,
  selector: 'app-upload-input',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
  ],
  templateUrl: './upload-input.component.html',
  styleUrl: './upload-input.component.scss',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class UploadInputComponent implements DynamicInputComponent, OnInit {
  field = input.required<DynamicField>();
  form = input.required<FormGroup>();
  formUtils = FormUtils;

  selectedFiles = signal<File[]>([]);
  fileErrors = signal<string[]>([]);
  selectedErrors = signal<ValidationErrors[]>([]);

  readonly errorMatcher = new FileErrorStateMatcher();

  fileNames = linkedSignal({
    source: this.selectedFiles,
    computation: files => files.map(f => f.name),
  });

  private get config(): FileFieldConfig {
    return this.field().fileConfig ?? {};
  }

  ngOnInit(): void {
    const names = this.config.prefillFileNames ?? [];
    if (!names.length) return;

    const placeholders = names.map(name => new File([], name));
    this.selectedFiles.set(placeholders);

    const control = this.form().get(this.field().name);
    control?.setValue(names);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    let accumulatedErrors: ValidationErrors = {};

    this.fileErrors.set([]);
    this.selectedErrors.set([]);

    for (const file of input.files) {
      const errors = this.validate(file);
      if (errors) {
        accumulatedErrors = { ...accumulatedErrors, ...errors };
        continue;
      }
      this.selectedFiles.update(selectedFilesPrev => [
        ...selectedFilesPrev,
        file,
      ]);
      this.config.onFileSelected?.(file);
    }

    const control = this.form().get(this.field().name);

    control?.setValue(this.selectedFiles());
    control?.markAsDirty();
    control?.markAsTouched();
    input.value = '';

    if (Object.keys(accumulatedErrors).length > 0) {
      control?.setErrors(accumulatedErrors);
      this.errorMatcher.setHasErrors(true);
    } else {
      control?.setErrors(null);
      this.errorMatcher.setHasErrors(false);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.update(prev => prev.filter((file, i) => i !== index));
    this.config.onFileRemoved?.(index);
    this.form().get(this.field().name)?.setValue(this.selectedFiles());
    this.form().get(this.field().name)?.markAsDirty();
    this.errorMatcher.setHasErrors(false);
  }

  private validate(file: File): ValidationErrors | null {
    const FILE_CONFIG = {
      maxFiles: this.field().fileConfig?.maxFiles ?? 1,
      maxSizeMb: this.field().fileConfig?.maxSizeMb ?? 1024,
      allowedMimeTypes: this.field().fileConfig?.allowedMimeTypes ?? [],
      allowedExtensions: this.field().fileConfig?.allowedExtensions ?? '',
    };
    if (this.selectedFiles().length >= FILE_CONFIG.maxFiles) {
      return { maxFiles: { max: FILE_CONFIG.maxFiles } };
    }
    if (
      this.selectedFiles().some(
        f => f.name === file.name && f.size === file.size
      )
    ) {
      return { duplicated: { fileName: file.name } };
    }
    if (!FILE_CONFIG.allowedMimeTypes.includes(file.type)) {
      return {
        fileFormat: {
          fileName: file.name,
          extensions: FILE_CONFIG.allowedExtensions,
        },
      };
    }
    if (file.size > FILE_CONFIG.maxSizeMb) {
      return { maxSize: { fileName: file.name, maxMb: FILE_CONFIG.maxSizeMb } };
    }
    return null;
  }
}
