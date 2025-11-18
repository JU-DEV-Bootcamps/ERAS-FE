import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { DynamicField, FormControlTuple } from './form-factory.interface';
import { FormFactoryService } from './form-factory.service';
import { CustomValidators } from '@core/utils/forms/custom-validators';

/**
 * @description
 * Dynamic component for creating forms from metadata.
 * This component dynamically helps us to generate forms from a list of fields (DynamicField).
 * It emits a ready to use 'FormGroup' using the 'formReady' event. For more detailed info,
 * please access to our wiki: https://github.com/JU-DEV-Bootcamps/ERAS/wiki/FORMS-%E2%80%90-FACTORY
 * @author José Luis Guevara
 * @created 11/18/2025
 */
@Component({
  selector: 'app-form-factory',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-factory.component.html',
})
export class FormFactoryComponent implements OnInit {
  @Output() formReady = new EventEmitter();
  fields = input<DynamicField[]>([]);

  form!: FormGroup;
  private _factory = inject(FormFactoryService);
  private _fb = inject(FormBuilder);

  ngOnInit() {
    const controls: FormControlTuple = {};

    this.fields().forEach((field: DynamicField) => {
      const initialValue = field.value ?? '';
      const isDisabled = field.disabled ?? false;

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

      controls[field.name] = [
        { value: initialValue, disabled: isDisabled },
        resolvedValidators,
      ];
    });
    this.form = this._fb.group(controls);
    this.formReady.emit(this.form);
  }

  get factory(): FormFactoryService {
    return this._factory;
  }
}
