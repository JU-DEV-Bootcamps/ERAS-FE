import { Component, computed, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormUtils } from '@core/utils/forms/form-utils';
import { DynamicField } from '../form-factory.interface';
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
    MatAutocompleteModule,
  ],
  templateUrl: './creatable-input.component.html',
  styleUrl: './creatable-input.component.scss',
})
export class CreatableInputComponent {
  field = input.required<DynamicField>();
  form = input.required<FormGroup>();
  formUtils = FormUtils;

  private _control = computed(() => this.form().get(this.field().name));

  private _createdOptions = signal<Lookup[]>([]);

  searchTerm = signal<string>('');
  isCreating = signal(false);
  isSaving = signal(false);
  createError = signal<string | null>(null);

  filteredOptions = computed(() => {
    const options = (this.field().options ?? []) as Lookup[];
    const term = (this.searchTerm() ?? '').toString().toLowerCase().trim();

    if (!term) return options;

    return options.filter(option => option.label.toLowerCase().includes(term));
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
    this._control()?.setValue(option);
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

    if (!name || !onCreateFn) return;

    this.isSaving.set(true);
    this.createError.set(null);

    onCreateFn(name)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: created => {
          this._createdOptions.update(opts => [...opts, created]);
          this._control()?.setValue(created);
          this.searchTerm.set('');
          this.isCreating.set(false);
          trigger.closePanel();
        },
        error: err => {
          this.createError.set(err?.error?.message);
        },
      });
  }
}
