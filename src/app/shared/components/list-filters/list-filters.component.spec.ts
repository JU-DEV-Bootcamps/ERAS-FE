import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFiltersComponent } from './list-filters.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AppliedFilter,
  FilterField,
  FilterName,
  FilterType,
} from './models/list-filters.interface';
import { DebugElement } from '@angular/core';
import { SelectAllValue } from '@shared/directives/select-all-value';
import { By } from '@angular/platform-browser';
import { SelectMultipleVirtualScrollComponent } from '../form-field-virtual-scroll/select-multiple-virtual-scroll/select-multiple-virtual-scroll.component';
import {
  MultipleSelectItem,
  SingleSelectItem,
} from '../form-field-virtual-scroll/interfaces/select';

// Helpers and Stubs
const appliedFilters: AppliedFilter[] = [
  {
    name: FilterName.Status,
    value: ['created', 'completed'],
  },
  {
    name: FilterName.Type,
    value: 'Individual',
  },
];

const inputFields: FilterField[] = [
  {
    disabled: false,
    name: FilterName.Status,
    label: 'testFilter1',
    value: ['created', 'completed'],
    type: FilterType.virtualMultiSelect,
  },
  {
    disabled: false,
    name: FilterName.Type,
    label: 'testFilter2',
    value: 'Individual',
    type: FilterType.virtualSelect,
  },
];

describe('ListFiltersComponent', () => {
  let component: ListFiltersComponent;
  let fixture: ComponentFixture<ListFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFiltersComponent, ReactiveFormsModule],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(ListFiltersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create an empty FormGroup when no filterFields are provided', () => {
    fixture.componentRef.setInput('filterFields', []);
    fixture.detectChanges();

    expect(component.filtersForm).toBeDefined();
    expect(Object.keys(component.filtersForm.controls).length).toBe(0);
  });

  it('should create one FormControl per FilterField', () => {
    fixture.componentRef.setInput('filterFields', inputFields);
    fixture.detectChanges();

    expect(Object.keys(component.filtersForm.controls)).toHaveSize(2);
    expect(component.filtersForm.contains('status')).toBeTrue();
    expect(component.filtersForm.contains('type')).toBeTrue();
  });

  it('should initialise each control with the field initial value', () => {
    fixture.componentRef.setInput('filterFields', inputFields);
    fixture.detectChanges();

    const selectMultipleDebugEl: DebugElement = fixture.debugElement.query(
      By.css('app-select-multiple-virtual-scroll')
    );
    const selectMultipleInstance =
      selectMultipleDebugEl.componentInstance as SelectMultipleVirtualScrollComponent;
    const selectedValues: SelectAllValue[] = inputFields.find(
      f => f.type === FilterType.virtualMultiSelect
    )?.value as SelectAllValue[];
    selectMultipleInstance.selectedItemsValues.set(selectedValues);

    expect(component.filtersForm.get('status')?.value).toEqual([
      'created',
      'completed',
    ]);
    expect(component.filtersForm.get('type')?.value).toBe('Individual');
  });

  it('should disable a field if disable option is true', () => {
    const fields: FilterField[] = [
      {
        disabled: true,
        name: FilterName.Status,
        label: 'disabled',
        value: null,
        type: FilterType.virtualSelect,
      },
    ];
    fixture.componentRef.setInput('filterFields', fields);
    fixture.detectChanges();

    expect(component.filtersForm.get(FilterName.Status)?.disabled).toBeTrue();
  });

  it('should return the casted options', () => {
    const options: SingleSelectItem[] | MultipleSelectItem[] = [
      {
        label: 'test-option',
        value: 'test-value',
      },
      {
        label: 'test-option2',
        value: 'test-option2',
      },
    ];
    const castedElements = component.castToSingleSelect(options);

    expect(castedElements).toEqual(options as SingleSelectItem[]);
  });

  it('should cast elements to MultipleSelectItem[]', () => {
    const options: SingleSelectItem[] | MultipleSelectItem[] = [
      {
        label: 'test-option',
        value: 'test-value',
      },
      {
        label: 'test-option2',
        value: 'test-option2',
      },
    ];
    const castedElements = component.castToMultipleSelect(options);

    expect(castedElements).toEqual(options as MultipleSelectItem[]);
  });

  it('should return an empty array when options is undefined', () => {
    const result = component.castToSingleSelect(undefined);
    expect(result).toEqual([]);
  });

  it('should return an empty array when options is undefined', () => {
    const result = component.castToMultipleSelect(undefined);
    expect(result).toEqual([]);
  });

  it('should return an empty array when options is []', () => {
    const result = component.castToSingleSelect([]);
    expect(result).toEqual([]);
  });
  it('should return an empty array when options is []', () => {
    const result = component.castToMultipleSelect([]);
    expect(result).toEqual([]);
  });

  it('should emit appliedFilters with current form values when form is valid', () => {
    fixture.componentRef.setInput('filterFields', inputFields);
    fixture.detectChanges();

    const emitSpy = spyOn(component.appliedFilters, 'emit');

    component.onApply();

    expect(emitSpy).toHaveBeenCalledWith(appliedFilters);
  });

  it('should not emit when the form is invalid', () => {
    const fields: FilterField[] = [
      {
        disabled: false,
        name: FilterName.Status,
        label: 'testFilter1',
        value: null,
        type: FilterType.virtualSelect,
        validators: [Validators.required],
      },
    ];
    fixture.componentRef.setInput('filterFields', fields);
    fixture.detectChanges();

    const emitSpy = spyOn(component.appliedFilters, 'emit');

    component.onApply();

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
