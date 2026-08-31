import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatableInputComponent } from './creatable-input.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicField } from '../form-factory.interface';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { of, throwError } from 'rxjs';

describe('CreatableInputComponent', () => {
  let component: CreatableInputComponent;
  let fixture: ComponentFixture<CreatableInputComponent>;

  let form: FormGroup;
  let field: Partial<DynamicField>;
  // let control: FormControl;

  beforeEach(async () => {
    // control = new FormControl(null);
    form = new FormGroup({
      category: new FormControl(null),
    });
    field = {
      name: 'category',
      options: [
        { label: 'Device1', value: 'device1' },
        { label: 'Device2', value: 'device2' },
        { label: 'Device3', value: 'device3' },
      ],
      selectConfig: {},
    } as DynamicField;
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CreatableInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatableInputComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
  });

  it('should filter options case-insensitively', () => {
    component.searchTerm.set('1');
    expect(component.filteredOptions()).toEqual([
      { label: 'Device1', value: 'device1' },
    ]);
  });

  it('should trim whitespace and lowerCase', () => {
    component.searchTerm.set('  device ');
    expect(component.filteredOptions()).toEqual([
      { label: 'Device1', value: 'device1' },
      { label: 'Device2', value: 'device2' },
      { label: 'Device3', value: 'device3' },
    ]);
  });

  it('should return empty array when nothing matches', () => {
    component.searchTerm.set('monitor');
    expect(component.filteredOptions()).toEqual([]);
  });

  it('should return true when search term is empty', () => {
    component.searchTerm.set('');
    expect(component.hasExactMatch()).toBeTrue();
  });

  it('should return true for exact match', () => {
    component.searchTerm.set('device1');
    expect(component.hasExactMatch()).toBeTrue();
  });

  it('should return false when there is no exact match', () => {
    component.searchTerm.set('dev');
    expect(component.hasExactMatch()).toBeFalse();
  });

  it('should return empty string for null', () => {
    expect(component.displayFn(null)).toBe('');
  });

  it('should return string value unchanged', () => {
    expect(component.displayFn('abc')).toBe('abc');
  });

  it('should return lookup label', () => {
    expect(component.displayFn({ label: 'Test', value: 'Test' })).toBe('Test');
  });
  it('should update search term and clear errors', () => {
    component.createError.set('Some error');
    component.onInput('hello');
    expect(component.searchTerm()).toBe('hello');
    expect(component.createError()).toBeNull();
  });
  it('should set the control value and not reset state', () => {
    const option = {
      label: 'Apple',
      value: 1,
    };
    component.searchTerm.set('abc');
    component.isCreating.set(true);
    component.onOptionSelected(option);
    expect(form.get('category')?.value).toEqual(option);
    expect(component.searchTerm()).toBe('abc');
    expect(component.isCreating()).toBeFalse();
  });
  it('should enable creating mode and clear errors', () => {
    component.createError.set('error');
    component.startCreating();
    expect(component.isCreating()).toBeTrue();
    expect(component.createError()).toBeNull();
  });
  it('should disable creating mode and clear errors', () => {
    component.isCreating.set(true);
    component.createError.set('error');
    component.cancelCreating();
    expect(component.isCreating()).toBeFalse();
    expect(component.createError()).toBeNull();
  });

  describe('save', () => {
    let trigger: jasmine.SpyObj<MatAutocompleteTrigger>;

    beforeEach(() => {
      trigger = jasmine.createSpyObj('MatAutocompleteTrigger', ['closePanel']);
    });

    it('should do nothing when search term is empty', () => {
      const spy = jasmine.createSpy();

      field!.selectConfig!.onCreateRecord = spy;

      component.searchTerm.set('   ');

      component.save(trigger);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should do nothing when onCreateRecord is missing', () => {
      field.selectConfig = {};

      component.searchTerm.set('New');

      component.save(trigger);

      expect(component.isSaving()).toBeFalse();
    });

    it('should create a new option successfully', () => {
      const created = {
        label: 'Ignored',
        value: 999,
      };
      field.selectConfig!.onCreateRecord = jasmine
        .createSpy()
        .and.returnValue(of(created));
      component.searchTerm.set('New Item');

      component.save(trigger);

      expect(field!.selectConfig!.onCreateRecord).toHaveBeenCalledWith(
        'New Item'
      );

      expect(form.get('category')?.value).toEqual({
        label: 'New Item',
        value: 'New Item',
      });

      expect(component.searchTerm()).toBe('');
      expect(component.isCreating()).toBeFalse();
      expect(component.isSaving()).toBeFalse();
      expect(component.createError()).toBeNull();
      expect(trigger.closePanel).toHaveBeenCalled();
    });

    it('should set error when creation fails', () => {
      field.selectConfig!.onCreateRecord = jasmine.createSpy().and.returnValue(
        throwError(() => ({
          error: {
            message: 'Creation failed',
          },
        }))
      );
      component.searchTerm.set('New Item');
      component.save(trigger);
      expect(component.createError()).toBe('Creation failed');
      expect(component.isSaving()).toBeFalse();
      expect(trigger.closePanel).not.toHaveBeenCalled();
    });

    it('should clear previous error before saving', () => {
      field.selectConfig!.onCreateRecord = jasmine
        .createSpy()
        .and.returnValue(of({}));

      component.createError.set('Old error');
      component.searchTerm.set('Test');

      component.save(trigger);

      expect(component.createError()).toBeNull();
    });
  });
});
