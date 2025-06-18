import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rangeTimestamp',
})
export class RangeTimestampPipe implements PipeTransform {
  transform(value: { startDate: string; endDate: string }): string {
    if (!value) return '';

    const sD = new Date(value.startDate);
    const sDFormat = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(sD);

    const eD = new Date(value.endDate);
    const eDFormat = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(eD);

    return `${sDFormat} to ${eDFormat}`;
  }
}
