import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FormFactoryComponent } from './form-factory.component';
import { FormFactoryService } from './form-factory.service';
import { DynamicField } from './form-factory.interface';

describe('FormFactoryComponent', () => {
  let component: FormFactoryComponent;
  let fixture: ComponentFixture<FormFactoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFactoryComponent, ReactiveFormsModule],
      providers: [FormBuilder, FormFactoryService],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFactoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('fields', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create an empty FormGroup when no fields are provided', () => {
    fixture.componentRef.setInput('fields', []);
    fixture.detectChanges();

    expect(component.form).toBeDefined();
    expect(Object.keys(component.form.controls).length).toBe(0);
  });

  it('should create one control per field with the given name and value', () => {
    const fields: DynamicField[] = [
      { name: 'firstName', label: 'First Name', type: 'text', value: 'John' },
      { name: 'lastName', label: 'Last Name', type: 'text', value: 'Doe' },
    ];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    expect(Object.keys(component.form.controls)).toHaveSize(2);
    expect(component.form.get('firstName')?.value).toBe('John');
    expect(component.form.get('lastName')?.value).toBe('Doe');
  });

  it('should default a control value to an empty string when value is not provided', () => {
    const fields: DynamicField[] = [
      { name: 'nickname', label: 'Nickname', type: 'text' },
    ];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    expect(component.form.get('nickname')?.value).toBe('');
  });

  it('should default a control value to an empty string when value is null', () => {
    const fields: DynamicField[] = [
      {
        name: 'nickname',
        label: 'Nickname',
        type: 'text',
        value: null as unknown as string,
      },
    ];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    expect(component.form.get('nickname')?.value).toBe('');
  });

  it('should disable a control when disabled is true', () => {
    const fields: DynamicField[] = [
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        value: 'John',
        disabled: true,
      },
    ];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    expect(component.form.get('firstName')?.disabled).toBeTrue();
  });

  it('should default disabled to false when not provided', () => {
    const fields: DynamicField[] = [
      { name: 'firstName', label: 'First Name', type: 'text', value: 'John' },
    ];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    expect(component.form.get('firstName')?.disabled).toBeFalse();
  });

  it('should resolve a string validator key against Validators and apply it', () => {
    const fields: DynamicField[] = [
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        value: '',
        validators: ['required'],
      },
    ];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    expect(component.form.get('email')?.invalid).toBeTrue();
    expect(component.form.get('email')?.errors?.['required']).toBeTruthy();
  });

  it('should ignore an unrecognized string validator key without throwing', () => {
    const fields: DynamicField[] = [
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        value: '',
        validators: ['notARealValidator'],
      },
    ];

    expect(() => {
      fixture.componentRef.setInput('fields', fields);
      fixture.detectChanges();
    }).not.toThrow();

    expect(component.form.get('email')?.valid).toBeTrue();
  });

  it('should accept a validator passed directly as a function', () => {
    const fields: DynamicField[] = [
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        value: '',
        validators: [Validators.required],
      },
    ];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    expect(component.form.get('email')?.invalid).toBeTrue();
  });

  it('should default to no validators when validators is not provided', () => {
    const fields: DynamicField[] = [
      { name: 'email', label: 'Email', type: 'text', value: '' },
    ];
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();

    expect(component.form.get('email')?.valid).toBeTrue();
  });

  it('should emit formReady with the built FormGroup on init', () => {
    const emitSpy = spyOn(component.formReady, 'emit');
    const fields: DynamicField[] = [
      { name: 'firstName', label: 'First Name', type: 'text', value: 'John' },
    ];
    fixture.componentRef.setInput('fields', fields);

    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith(component.form);
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should return the injected FormFactoryService via the factory getter', () => {
    fixture.componentRef.setInput('fields', []);
    fixture.detectChanges();

    expect(component.factory).toBeInstanceOf(FormFactoryService);
  });
});
