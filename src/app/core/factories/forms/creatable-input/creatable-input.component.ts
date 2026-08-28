import { Component, computed, input, InputSignal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormUtils } from '@core/utils/forms/form-utils';
import { DynamicField, DynamicInputComponent } from '../form-factory.interface';
import { MatLabel } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import {
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { Lookup } from '@core/models/lookup';
import { finalize } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { validateName } from '@core/utils/validators/name.validator';

@Component({
  selector: 'app-creatable-component',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatLabel,
    MatFormFieldModule,
    CommonModule,
    MatAutocompleteModule,
  ],
  templateUrl: './creatable-input.component.html',
  styleUrl: './creatable-input.component.scss',
})
export class CreatableInputComponent implements DynamicInputComponent {
  field: InputSignal<DynamicField> = input.required<DynamicField>();
  form: InputSignal<FormGroup> = input.required<FormGroup>();
  formUtils = FormUtils;

  control = computed(() => this.form().get(this.field().name) as FormControl);

  private _createdOptions = signal<Lookup[]>([]);

  searchTerm = signal<string>('');
  isCreating = signal(false);
  isSaving = signal(false);
  createError = signal<string | null>(null);

  filteredOptions = computed(() => {
    const options = (this.field().options ?? []) as Lookup[];
    const lastOptions = [...options, ...this._createdOptions()];
    const term = (this.searchTerm() ?? '').toString().toLowerCase().trim();

    if (!term) return lastOptions;

    return lastOptions.filter(option =>
      option.label.toLowerCase().includes(term)
    );
  });

  hasExactMatch = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return true;
    return this.filteredOptions().some(o => o.label.toLowerCase() === term);
  });

  displayFn = (value: string | Lookup | null): string => {
    if (!value) return '';
    return typeof value === 'string' ? value : (value.label ?? '');
  };

  onInput(inputValue: string): void {
    this.searchTerm.set(inputValue);
    this.createError.set(null);
  }

  onOptionSelected(option: Lookup): void {
    this.control()?.setValue(option);
    this.searchTerm.set('');
    this.isCreating.set(false);
  }

  startCreating(): void {
    this.isCreating.set(true);
    this.createError.set(null);
  }

  cancelCreating(): void {
    this.isCreating.set(false);
    this.createError.set(null);
  }

  save(trigger: MatAutocompleteTrigger): void {
    const name = this.searchTerm().trim();
    const onCreateFn = this.field().selectConfig?.onCreateRecord;

    if (!name || !onCreateFn || this.hasExactMatch()) return;

    const validationError = validateName(this.searchTerm());
    if (validationError) {
      this.createError.set(validationError);
      trigger.closePanel();
      return;
    }

    this.isSaving.set(true);
    this.createError.set(null);

    onCreateFn(name)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: created => {
          created = { label: name, value: name };
          this._createdOptions.update(opts => [...opts, created]);
          this.control()?.setValue(created);
          this.searchTerm.set('');
          this.isCreating.set(false);
          trigger.closePanel();
        },
        error: err => {
          this.createError.set(err?.error?.message);
          trigger.closePanel();
        },
      });
  }
}
