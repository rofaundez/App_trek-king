import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';
    let date: Date;

    // Si es un objeto Firestore Timestamp
    if (value.seconds) {
      date = new Date(value.seconds * 1000);
    } else {
      date = new Date(value);
    }

    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return `hace ${seconds} segundo${seconds === 1 ? '' : 's'}`;
    } else if (seconds < 3600) {
      const minutos = Math.floor(seconds / 60);
      return `hace ${minutos} minuto${minutos === 1 ? '' : 's'}`;
    } else if (seconds < 86400) {
      const horas = Math.floor(seconds / 3600);
      return `hace ${horas} hora${horas === 1 ? '' : 's'}`;
    } else {
      const dias = Math.floor(seconds / 86400);
      return `hace ${dias} día${dias === 1 ? '' : 's'}`;
    }
  }
} 