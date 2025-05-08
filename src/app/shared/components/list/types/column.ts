import { PipeTransform } from '@angular/core';

export interface Column<T> {
  label: string;
  key: keyof T;
  pipe?: PipeTransform;
  pipeArgs?: unknown[];
}
