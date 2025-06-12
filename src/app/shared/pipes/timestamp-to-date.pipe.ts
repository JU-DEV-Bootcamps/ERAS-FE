import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestampToDate',
})
export class TimestampToDatePipe implements PipeTransform {
  transform(value: Date | null): string {
    if (!value) return '';

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour12: true,
    }).format(date);
  }
}
