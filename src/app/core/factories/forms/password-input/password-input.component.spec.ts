import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { PasswordInputComponent } from './password-input.component';
import { DynamicField } from '../form-factory.interface';
import { FormUtils } from '@core/utils/forms/form-utils';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, PasswordInputComponent],
  template: `
    <form [formGroup]="form">
      <app-password-input [field]="field" [form]="form"></app-password-input>
    </form>
  `,
})
class TestHostComponent {
  field: DynamicField = {
    key: 'password',
    name: 'password',
    label: 'Password',
    type: 'password',
  } as DynamicField;

  form = new FormGroup({
    password: new FormControl(''),
  });
}

describe('PasswordInputComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    host = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    const componentEl = hostFixture.debugElement.query(
      By.directive(PasswordInputComponent)
    );
    expect(componentEl).toBeTruthy();
  });

  it('should receive the field input', () => {
    const componentDe = hostFixture.debugElement.query(
      By.directive(PasswordInputComponent)
    );
    const component = componentDe.componentInstance as PasswordInputComponent;

    expect(component.field()).toEqual(host.field);
  });

  it('should receive the form input', () => {
    const componentDe = hostFixture.debugElement.query(
      By.directive(PasswordInputComponent)
    );
    const component = componentDe.componentInstance as PasswordInputComponent;

    expect(component.form()).toBe(host.form);
  });

  it('should expose FormUtils as a static reference', () => {
    const componentDe = hostFixture.debugElement.query(
      By.directive(PasswordInputComponent)
    );
    const component = componentDe.componentInstance as PasswordInputComponent;

    expect(component.formUtils).toBe(FormUtils);
  });

  it('should bind to the parent FormGroupDirective via ControlContainer', () => {
    const input = hostFixture.debugElement.query(By.css('input'))
      .nativeElement as HTMLInputElement;

    host.form.get('password')?.setValue('s3cr3t');
    hostFixture.detectChanges();

    expect(input.value).toBe('s3cr3t');
  });

  it('should render the input with type="password"', () => {
    const input = hostFixture.debugElement.query(By.css('input'))
      .nativeElement as HTMLInputElement;

    expect(input.type).toBe('password');
  });
});
