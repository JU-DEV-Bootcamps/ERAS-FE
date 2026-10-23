import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lastAccess',
})
export class LastAccessPipe implements PipeTransform {
  transform(value: number): string {
    if (isNaN(value)) return '';

    return `${value} days ago`;
  }
}
