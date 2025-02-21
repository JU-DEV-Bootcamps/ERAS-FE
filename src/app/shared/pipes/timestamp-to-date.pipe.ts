import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestampToDate'
})
export class TimestampToDatePipe implements PipeTransform {
  transform(value: string | null): string {
    if (!value) return '';

    // Convierte la cadena ISO a un objeto Date
    const date = new Date(value);

    // Verifica si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Invalid date'; // Maneja el caso de fecha inválida
    }

    // Usa Intl.DateTimeFormat para formatear la fecha
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  }
}
