import { EventEmitter, Type } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface ErasModalData<T extends InnerComponent = InnerComponent> {
  component?: Type<T>;
  form?: FormGroup;
  actions?: ErasModalAction[];
  closeButton?: boolean;
  title?: string;
}

export interface ErasModalAction {
  label: string;
  value?: string;
  close?: boolean;
}

export interface InnerComponent {
  form?: FormGroup;
  formReady?: EventEmitter<FormGroup>;
}
