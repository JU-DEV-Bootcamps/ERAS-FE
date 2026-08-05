import { Injectable, Type } from '@angular/core';

import { DynamicInputComponent } from './form-factory.interface';

import { DateInputComponent } from './date-input/date-input.component';
import { SelectInputComponent } from './select-input/select-input.component';
import { TextareaInputComponent } from './textarea-input/textarea-input.component';
import { TextInputComponent } from './text-input/text-input.component';
import { PasswordInputComponent } from './password-input/password-input.component';
import { SearchableSelectComponent } from './searchable-select/searchable-select.component';
import { UploadInputComponent } from './upload-input/upload-input.component';
import { NumberInputComponent } from './number-input/number-input.component';
import { CreatableInputComponent } from './creatable-input/creatable-input.component';

@Injectable({
  providedIn: 'root',
})
export class FormFactoryService {
  private _componentsMapper: Record<string, Type<DynamicInputComponent>> = {
    date: DateInputComponent,
    select: SelectInputComponent,
    text: TextInputComponent,
    textarea: TextareaInputComponent,
    password: PasswordInputComponent,
    searchableSelect: SearchableSelectComponent,
    file: UploadInputComponent,
    number: NumberInputComponent,
    creatableSelect: CreatableInputComponent,
  };

  getComponentByType(type: string): Type<DynamicInputComponent> {
    return this._componentsMapper[type];
  }
}
