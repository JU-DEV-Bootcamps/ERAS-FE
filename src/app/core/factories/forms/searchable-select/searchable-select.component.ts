import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { DynamicField, DynamicInputComponent } from '../form-factory.interface';
import { FormControl, FormGroup } from '@angular/forms';
import { FormUtils } from '@core/utils/forms/form-utils';
import { SelectMultipleVirtualScrollComponent } from '@shared/components/form-field-virtual-scroll/select-multiple-virtual-scroll/select-multiple-virtual-scroll.component';
import { MultipleSelectItem } from '@shared/components/form-field-virtual-scroll/interfaces/select';

@Component({
  selector: 'app-searchable-select',
  imports: [SelectMultipleVirtualScrollComponent],
  templateUrl: './searchable-select.component.html',
})
export class SearchableSelectComponent implements DynamicInputComponent {
  field: InputSignal<DynamicField> = input.required<DynamicField>();
  form: InputSignal<FormGroup> = input.required<FormGroup>();
  formUtils = FormUtils;

  fieldControl: Signal<FormControl> = computed(() => {
    const control = this.form().get(this.field().name) as FormControl;
    if (this.field().value) {
      control.patchValue(this.field().value);
    }
    return control;
  });
  items: Signal<MultipleSelectItem[]> = computed(() => {
    const options = this.field().options;

    if (options) {
      return options.map(option => {
        return {
          label: option.label,
          value: option.value,
        } as MultipleSelectItem;
      });
    }

    return [{}] as unknown as MultipleSelectItem[];
  });
}
