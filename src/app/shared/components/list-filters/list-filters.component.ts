import { Component, inject, input, OnInit, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AppliedFilter,
  FilterField,
  FilterName,
  FilterValue,
} from './models/list-filters.interface';
import { SelectMultipleVirtualScrollComponent } from '../form-field-virtual-scroll/select-multiple-virtual-scroll/select-multiple-virtual-scroll.component';
import { SelectVirtualScrollComponent } from '../form-field-virtual-scroll/select-virtual-scroll/select-virtual-scroll.component';
import {
  MultipleSelectItem,
  SingleSelectItem,
} from '../form-field-virtual-scroll/interfaces/select';
import { CustomValidators } from '@core/utils/forms/custom-validators';
import { ErasButtonComponent } from '../buttons/eras-button/eras-button.component';

@Component({
  selector: 'app-list-filters',
  imports: [
    ErasButtonComponent,
    ReactiveFormsModule,
    SelectMultipleVirtualScrollComponent,
    SelectVirtualScrollComponent,
  ],
  templateUrl: './list-filters.component.html',
  styleUrl: './list-filters.component.scss',
})
export class ListFiltersComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);

  readonly filterFields = input<FilterField[]>([]);
  readonly appliedFilters = output<AppliedFilter[]>();
  filtersForm!: FormGroup<Record<string, FormControl<FilterValue>>>;

  ngOnInit(): void {
    const controls: Record<string, FormControl<FilterValue>> = {};

    this.filterFields().forEach((field: FilterField) => {
      const initialValue = field.value;
      const isDisabled = field.disabled;

      const resolvedValidators = (field.validators ?? [])
        .map(validator => {
          if (typeof validator === 'string') {
            return (
              CustomValidators[validator] ||
              Validators[validator as keyof typeof Validators]
            );
          }
          return validator;
        })
        .filter(Boolean);

      controls[field.name] = new FormControl(
        { value: initialValue, disabled: isDisabled },
        resolvedValidators
      );
    });

    this.filtersForm = this._formBuilder.group(controls);
  }

  castToSingleSelect(options?: SingleSelectItem[] | MultipleSelectItem[]) {
    return options ? (options as SingleSelectItem[]) : [];
  }

  castToMultipleSelect(options?: SingleSelectItem[] | MultipleSelectItem[]) {
    return options ? (options as MultipleSelectItem[]) : [];
  }

  onApply() {
    if (this.filtersForm.valid) {
      const appliedFilters: AppliedFilter[] = [];
      const formValue = this.filtersForm.value;
      Object.keys(formValue).forEach(filterKey => {
        appliedFilters.push({
          name: filterKey as FilterName,
          value: formValue[filterKey] ?? null,
        });
      });
      this.appliedFilters.emit(appliedFilters);
    }
  }
}
