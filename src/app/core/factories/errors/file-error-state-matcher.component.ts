import { signal } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class FileErrorStateMatcher implements ErrorStateMatcher {
  private _hasErrors = signal(false);
  readonly hasErrors = this._hasErrors.asReadonly();

  setHasErrors(value: boolean): void {
    this._hasErrors.set(value);
  }

  isErrorState(
    control: FormControl | null,
    _form: FormGroupDirective | NgForm | null
  ): boolean {
    void _form;
    return this._hasErrors();
  }
}
