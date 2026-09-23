import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { SelectInputComponent } from './select-input.component';
import { DynamicField } from '../form-factory.interface';
import {
  ALERT_RISK_COLORS,
  ALERT_RISK_LABEL_COLORS,
} from '@core/constants/alertRiskLevel';
import { LookupExtended } from '@core/models/lookup';

@Component({
  selector: 'app-host',
  standalone: true,
  imports: [ReactiveFormsModule, SelectInputComponent],
  template: `
    <form [formGroup]="form">
      <app-select-input [field]="field" [form]="form"></app-select-input>
    </form>
  `,
})
class HostComponent {
  form!: FormGroup;
  field!: DynamicField;
}

describe('SelectInputComponent', () => {
  let hostFixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: SelectInputComponent;

  const options = [
    { value: 1, label: 'Low' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'High' },
  ];

  const mockField: DynamicField = {
    name: 'riskLevel',
    label: 'Risk Level',
    type: 'select',
    options,
  } as unknown as DynamicField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostComponent);
    host = hostFixture.componentInstance;
  });

  function initComponent(
    initialValue: unknown = null,
    field: DynamicField = mockField
  ) {
    host.form = new FormGroup({ riskLevel: new FormControl(initialValue) });
    host.field = field;
    hostFixture.detectChanges();

    component = hostFixture.debugElement.query(
      el => el.componentInstance instanceof SelectInputComponent
    ).componentInstance as SelectInputComponent;
  }

  it('should create', () => {
    initComponent();
    expect(component).toBeTruthy();
  });

  describe('selectedOption', () => {
    it('should be undefined when the control has no value', () => {
      initComponent(null);
      expect(component.selectedOption()).toBeUndefined();
    });

    it('should resolve the matching option based on the control value', () => {
      initComponent(2);
      expect(component.selectedOption()).toEqual(options[1]);
    });

    it('should update reactively when the control value changes', () => {
      initComponent(1);
      expect(component.selectedOption()).toEqual(options[0]);

      host.form.get('riskLevel')?.setValue(3);
      hostFixture.detectChanges();

      expect(component.selectedOption()).toEqual(options[2]);
    });

    it('should be undefined when field has no options', () => {
      const fieldWithoutOptions: DynamicField = {
        name: 'riskLevel',
        label: 'Risk Level',
        type: 'select',
      } as unknown as DynamicField;
      initComponent(1, fieldWithoutOptions);

      expect(component.selectedOption()).toBeUndefined();
    });
  });

  describe('onRemoveChip', () => {
    it('should set the control value to null', () => {
      initComponent(2);

      component.onRemoveChip();

      expect(host.form.get('riskLevel')?.value).toBeNull();
    });
  });

  describe('getRiskLevelColor', () => {
    it('should return the color from the selected option when it has custom colors', () => {
      const colorOptions = [
        {
          value: 1,
          label: 'Low',
          colors: { background: '#abc123', label: '#000' },
        } as unknown as LookupExtended,
      ];
      const fieldWithColors: DynamicField = {
        name: 'riskLevel',
        label: 'Risk Level',
        type: 'select',
        options: colorOptions,
      } as unknown as DynamicField;
      initComponent(1, fieldWithColors);

      expect(component.getRiskLevelColor('1')).toBe('#abc123');
    });

    it('should fall back to ALERT_RISK_COLORS when the option has no colors', () => {
      initComponent(2);

      const level = '2';
      expect(component.getRiskLevelColor(level)).toBe(ALERT_RISK_COLORS[level]);
    });
  });

  describe('getRiskLevelLabelColor', () => {
    it('should return the label color from the selected option when it has custom colors', () => {
      const colorOptions = [
        {
          value: 1,
          label: 'Low',
          colors: { background: '#abc123', label: '#fff' },
        } as unknown as LookupExtended,
      ];
      const fieldWithColors: DynamicField = {
        name: 'riskLevel',
        label: 'Risk Level',
        type: 'select',
        options: colorOptions,
      } as unknown as DynamicField;
      initComponent(1, fieldWithColors);

      expect(component.getRiskLevelLabelColor('1')).toBe('#fff');
    });

    it('should fall back to ALERT_RISK_LABEL_COLORS[level] when the option has no colors', () => {
      initComponent(2);

      const level = '2';
      expect(component.getRiskLevelLabelColor(level)).toBe(
        ALERT_RISK_LABEL_COLORS[level] ?? ALERT_RISK_LABEL_COLORS['default']
      );
    });

    it('should fall back to ALERT_RISK_LABEL_COLORS.default when the level itself has no entry', () => {
      initComponent(2);

      const unknownLevel = 'nonexistent-level';
      expect(component.getRiskLevelLabelColor(unknownLevel)).toBe(
        ALERT_RISK_LABEL_COLORS['default']
      );
    });
  });
});
