import { Directive, HostListener, Input } from '@angular/core';

type DateSegmentKey = 'day' | 'month' | 'year';

@Directive({
  selector: '[appDateAutoFormat]',
  standalone: true,
})
export class DateAutoFormatDirective {
  @Input() segmentOrder: DateSegmentKey[] = ['month', 'day', 'year'];

  private readonly segmentLength: Record<DateSegmentKey, number> = {
    day: 2,
    month: 2,
    year: 4,
  };

  private readonly segmentMax: Record<DateSegmentKey, number | null> = {
    day: 31,
    month: 12,
    year: null,
  };

  private readonly twoDigitStarters: Record<DateSegmentKey, string[]> = {
    day: ['0', '1', '2', '3'],
    month: ['0', '1'],
    year: [],
  };

  private previousLength = 0;

  @HostListener('input', ['$event.target'])
  onInput(input: HTMLInputElement): void {
    const isDeleting = input.value.length < this.previousLength;
    const cursorPos = input.selectionStart ?? input.value.length;
    const digitsBeforeCursor = input.value
      .slice(0, cursorPos)
      .replace(/\D/g, '').length;

    const totalDigits = this.segmentOrder.reduce(
      (sum, k) => sum + this.segmentLength[k],
      0
    );
    const digits = input.value.replace(/\D/g, '').slice(0, totalDigits);

    const formatted = this.buildFormattedValue(digits, isDeleting);
    const changed = formatted !== input.value;

    input.value = formatted;
    const newCursor = this.cursorForDigitCount(formatted, digitsBeforeCursor);
    input.setSelectionRange(newCursor, newCursor);
    this.previousLength = formatted.length;

    if (changed) {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  @HostListener('blur', ['$event.target'])
  onBlur(input: HTMLInputElement): void {
    const parts = input.value.split('/');
    let changed = false;

    this.segmentOrder.forEach((key, i) => {
      if (key !== 'year' && parts[i] && parts[i].length === 1) {
        parts[i] = parts[i].padStart(2, '0');
        changed = true;
      }
    });

    if (changed) {
      input.value = parts.join('/');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    this.previousLength = input.value.length;
  }

  private buildFormattedValue(digits: string, isDeleting: boolean): string {
    const segments: string[] = [];
    let cursor = 0;

    for (const key of this.segmentOrder) {
      if (cursor >= digits.length) {
        break;
      }

      const maxLen = this.segmentLength[key];
      let chunkLength: number;

      if (key === 'year' || isDeleting) {
        chunkLength = Math.min(maxLen, digits.length - cursor);
      } else {
        const firstDigit = digits[cursor];
        const takesTwoDigits = this.twoDigitStarters[key].includes(firstDigit);
        chunkLength = takesTwoDigits
          ? Math.min(maxLen, digits.length - cursor)
          : 1;
      }

      let chunk = digits.slice(cursor, cursor + chunkLength);

      const max = this.segmentMax[key];
      if (!isDeleting && chunk.length === 2 && max !== null) {
        const numeric = parseInt(chunk, 10);
        if (numeric > max) {
          chunk = String(max).padStart(2, '0');
        } else if (numeric === 0) {
          chunk = '01';
        }
      }

      const hasMoreDigitsAfter = cursor + chunkLength < digits.length;
      const shouldPad =
        key !== 'year' &&
        chunkLength === 1 &&
        !isDeleting &&
        hasMoreDigitsAfter;

      segments.push(shouldPad ? chunk.padStart(2, '0') : chunk);
      cursor += chunkLength;
    }

    return segments.join('/');
  }

  private cursorForDigitCount(formatted: string, digitCount: number): number {
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        seen++;
        if (seen === digitCount) {
          return i + 1;
        }
      }
    }
    return formatted.length;
  }
}
