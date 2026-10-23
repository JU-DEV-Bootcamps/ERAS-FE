import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { TextInputComponent } from './text-input.component';
import { DynamicField } from '../form-factory.interface';
import { FormUtils } from '@core/utils/forms/form-utils';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent],
  template: `
    <form [formGroup]="form">
      <app-text-input [field]="field" [form]="form"></app-text-input>
    </form>
  `,
})
class TestHostComponent {
  field: DynamicField = {
    key: 'name',
    name: 'name',
    label: 'Name',
    type: 'text',
  } as DynamicField;

  form = new FormGroup({
    name: new FormControl(''),
  });
}

describe('TextInputComponent', () => {
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
      By.directive(TextInputComponent)
    );
    expect(componentEl).toBeTruthy();
  });

  it('should receive the field input', () => {
    const componentDe = hostFixture.debugElement.query(
      By.directive(TextInputComponent)
    );
    const component = componentDe.componentInstance as TextInputComponent;

    expect(component.field()).toEqual(host.field);
  });

  it('should receive the form input', () => {
    const componentDe = hostFixture.debugElement.query(
      By.directive(TextInputComponent)
    );
    const component = componentDe.componentInstance as TextInputComponent;

    expect(component.form()).toBe(host.form);
  });

  it('should expose FormUtils as a static reference', () => {
    const componentDe = hostFixture.debugElement.query(
      By.directive(TextInputComponent)
    );
    const component = componentDe.componentInstance as TextInputComponent;

    expect(component.formUtils).toBe(FormUtils);
  });

  it('should bind to the parent FormGroupDirective via ControlContainer', () => {
    const input = hostFixture.debugElement.query(By.css('input'))
      .nativeElement as HTMLInputElement;

    host.form.get('name')?.setValue('Lucia');
    hostFixture.detectChanges();

    expect(input.value).toBe('Lucia');
  });
});
