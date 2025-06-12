import { PipeTransform, TemplateRef } from '@angular/core';

export interface Column<T> {
  label: string;
  key: keyof T;
  pipe?: PipeTransform;
  pipeKey?: keyof T;
  pipeArgs?: unknown[];
}

export interface ComponentColumn {
  label: string;
  template: TemplateRef<unknown>;
  componentInputs: unknown[];
}
