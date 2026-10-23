import { Component, computed, input } from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DynamicField, DynamicInputComponent } from '../form-factory.interface';
import { FormUtils } from '@core/utils/forms/form-utils';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, startWith, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  ALERT_RISK_COLORS,
  ALERT_RISK_LABEL_COLORS,
} from '@core/constants/alertRiskLevel';
import { LookupExtended } from '@core/models/lookup';

@Component({
  selector: 'app-select-input',
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './select-input.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class SelectInputComponent implements DynamicInputComponent {
  field = input.required<DynamicField>();
  form = input.required<FormGroup>();
  formUtils = FormUtils;

  private control = computed(() => this.form().get(this.field().name));

  private fieldValue = toSignal(
    toObservable(this.control).pipe(
      switchMap(control =>
        control ? control.valueChanges.pipe(startWith(control.value)) : of(null)
      )
    ),
    { initialValue: null }
  );

  selectedOption = computed(() => {
    const value = this.fieldValue();
    return this.field().options?.find(o => o.value === value);
  });

  onRemoveChip(): void {
    this.control()?.setValue(null);
  }

  getRiskLevelColor(level: string): string {
    const optionWithColor = this.selectedOption();
    if ((optionWithColor as LookupExtended).colors !== undefined) {
      return (optionWithColor as LookupExtended).colors.background;
    }
    return ALERT_RISK_COLORS[level];
  }

  getRiskLevelLabelColor(level: string): string {
    const optionWithColor = this.selectedOption();
    if ((optionWithColor as LookupExtended).colors !== undefined) {
      return (optionWithColor as LookupExtended).colors.label;
    }
    return ALERT_RISK_LABEL_COLORS[level] ?? ALERT_RISK_LABEL_COLORS['default'];
  }
}
