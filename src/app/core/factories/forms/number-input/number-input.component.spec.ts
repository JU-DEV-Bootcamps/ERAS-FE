import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { NumberInputComponent } from './number-input.component';
import { DynamicField } from '../form-factory.interface';
import { FormUtils } from '@core/utils/forms/form-utils';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NumberInputComponent],
  template: `
    <form [formGroup]="form">
      <app-number-input [field]="field" [form]="form"></app-number-input>
    </form>
  `,
})
class TestHostComponent {
  field: DynamicField = {
    key: 'quantity',
    name: 'quantity',
    label: 'Quantity',
    type: 'number',
  } as DynamicField;

  form = new FormGroup({
    quantity: new FormControl(0),
  });
}

describe('NumberInputComponent', () => {
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
      By.directive(NumberInputComponent)
    );
    expect(componentEl).toBeTruthy();
  });

  it('should receive the field input', () => {
    const componentDe = hostFixture.debugElement.query(
      By.directive(NumberInputComponent)
    );
    const component = componentDe.componentInstance as NumberInputComponent;

    expect(component.field()).toEqual(host.field);
  });

  it('should receive the form input', () => {
    const componentDe = hostFixture.debugElement.query(
      By.directive(NumberInputComponent)
    );
    const component = componentDe.componentInstance as NumberInputComponent;

    expect(component.form()).toBe(host.form);
  });

  it('should expose FormUtils as a static reference', () => {
    const componentDe = hostFixture.debugElement.query(
      By.directive(NumberInputComponent)
    );
    const component = componentDe.componentInstance as NumberInputComponent;

    expect(component.formUtils).toBe(FormUtils);
  });

  it('should bind to the parent FormGroupDirective via ControlContainer', () => {
    const input = hostFixture.debugElement.query(By.css('input'))
      .nativeElement as HTMLInputElement;

    host.form.get('quantity')?.setValue(42);
    hostFixture.detectChanges();

    expect(input.value).toBe('42');
  });
});
