import { Pipe, PipeTransform } from '@angular/core';
import { countries } from '../../core/constants/countries';

// Pipe to get the English name from alpha-3 code
@Pipe({
  name: 'alpha3CountryName',
  standalone: true,
})
export class Alpha3CountryNamePipe implements PipeTransform {
  transform(alpha3: string | null | undefined): string {
    if (!alpha3) return '';
    const country = countries.find(
      c => c.alpha3?.toLowerCase() === alpha3.toLowerCase()
    );
    return country?.translations?.en || '';
  }
}

// Pipe to get the flag emoji from alpha-3 code
@Pipe({
  name: 'alpha3Flag',
  standalone: true,
})
export class Alpha3FlagPipe implements PipeTransform {
  transform(alpha3: string | null | undefined): string {
    if (!alpha3) return '';
    const country = countries.find(
      c => c.alpha3.toLowerCase() === alpha3.toLowerCase()
    );
    if (!country?.alpha2) return '';
    const alpha2 = country.alpha2.toUpperCase();
    const emoji = String.fromCodePoint(
      ...alpha2.split('').map(char => 0x1f1e6 + char.charCodeAt(0) - 65)
    );
    return emoji;
  }
}
