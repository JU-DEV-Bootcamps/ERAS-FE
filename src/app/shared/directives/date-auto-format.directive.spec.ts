import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DateAutoFormatDirective } from './date-auto-format.directive';

type DateSegmentKey = 'day' | 'month' | 'year';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, DateAutoFormatDirective],
  template: `<input
    appDateAutoFormat
    [segmentOrder]="segmentOrder"
    [formControl]="control"
  />`,
})
class TestHostComponent {
  segmentOrder: DateSegmentKey[] = ['month', 'day', 'year'];
  control = new FormControl('');
}

describe('DateAutoFormatDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let input: HTMLInputElement;

  function setup(segmentOrder: DateSegmentKey[] = ['month', 'day', 'year']) {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    host.segmentOrder = segmentOrder;
    fixture.detectChanges();

    const inputDebugEl = fixture.debugElement.query(By.css('input'));
    input = inputDebugEl.nativeElement as HTMLInputElement;
  }

  // Dispara un evento 'input' real, igual que haría el navegador al
  // teclear, en vez de invocar los métodos del directive a mano — así
  // el ControlValueAccessor de Angular queda sincronizado exactamente
  // como en producción.
  function setInputValue(value: string): void {
    input.value = value;
    input.setSelectionRange(value.length, value.length);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  function typeChar(char: string): void {
    setInputValue(input.value + char);
  }

  function typeString(digits: string): void {
    for (const char of digits) {
      typeChar(char);
    }
  }

  function backspace(): void {
    setInputValue(input.value.slice(0, -1));
  }

  function blur(): void {
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  it('should create an instance', () => {
    setup();
    expect(
      fixture.debugElement.query(By.directive(DateAutoFormatDirective))
    ).toBeTruthy();
  });

  describe('typing without premature padding', () => {
    it('should not pad a single leading digit that could still form a two-digit month', () => {
      setup();
      typeChar('1');
      expect(input.value).toBe('1');
    });

    it('should complete "12" as a single month segment instead of splitting into "01/02"', () => {
      setup();
      typeString('12');
      expect(input.value).toBe('12');
    });

    it('should build a full date digit by digit without breaking segments', () => {
      setup();
      typeString('12252025');
      expect(input.value).toBe('12/25/2025');
    });

    it('should pad a completed single-digit month once a following segment starts', () => {
      setup();
      typeChar('3'); // month = 3, todavía podría ser final (no hay mes 30-39)
      expect(input.value).toBe('3');
      typeChar('5'); // arranca el día -> el mes ya se sabe cerrado -> se rellena a 03
      expect(input.value).toBe('03/5');
    });
  });

  describe('day accepts two digits starting with 2 or 3', () => {
    it('should allow "25" as a day', () => {
      setup(['day', 'month', 'year']);
      typeString('25');
      expect(input.value).toBe('25');
    });

    it('should allow "30" as a day', () => {
      setup(['day', 'month', 'year']);
      typeString('30');
      expect(input.value).toBe('30');
    });

    it('should allow "15" as a day', () => {
      setup(['day', 'month', 'year']);
      typeString('15');
      expect(input.value).toBe('15');
    });
  });

  describe('clamping out-of-range day/month values', () => {
    it('should clamp month "19" to "12"', () => {
      setup();
      typeString('19');
      expect(input.value).toBe('12');
    });

    it('should clamp day "39" to "31"', () => {
      setup(['day', 'month', 'year']);
      typeString('39');
      expect(input.value).toBe('31');
    });

    it('should convert "00" month to "01"', () => {
      setup();
      typeString('00');
      expect(input.value).toBe('01');
    });

    it('should convert "00" day to "01"', () => {
      setup(['day', 'month', 'year']);
      typeString('00');
      expect(input.value).toBe('01');
    });
  });

  describe('year handling', () => {
    it('should take up to 4 literal digits without century guessing', () => {
      setup();
      typeString('12255555');
      expect(input.value).toBe('12/25/5555');
    });

    it('should not exceed the 8-digit mask when extra digits are typed', () => {
      setup();
      typeString('041220251'); // dígito extra más allá de la máscara se ignora
      expect(input.value).toBe('04/12/2025');
    });
  });

  describe('deleting', () => {
    it('should shrink the value as the user deletes, without snapping back to "00"', () => {
      setup();
      typeString('05052025');
      expect(input.value).toBe('05/05/2025');

      // Solo verificamos la invariante clave del bug original: nunca debería
      // reaparecer un "00" inventado que no exista en lo que quedó tecleado.
      for (let i = 0; i < 10; i++) {
        backspace();
        expect(input.value).not.toContain('00');
      }

      expect(input.value).toBe('');
    });
  });

  describe('onBlur', () => {
    it('should pad a trailing single-digit segment on blur', () => {
      setup(['day', 'month', 'year']);
      typeChar('5');
      expect(input.value).toBe('5');

      blur();
      expect(input.value).toBe('05');
    });

    it('should not modify a value where segments are already two digits', () => {
      setup();
      typeString('05052025');
      expect(input.value).toBe('05/05/2025');

      blur();
      expect(input.value).toBe('05/05/2025');
    });
  });

  describe('FormControl synchronization', () => {
    it('should sync the FormControl value while typing, without needing blur', () => {
      setup();
      typeString('12252025');

      expect(host.control.value).toBe(input.value);
    });

    it('should sync the FormControl value after onBlur pads a segment', () => {
      setup(['day', 'month', 'year']);
      typeChar('5');
      blur();

      expect(host.control.value).toBe('05');
    });
  });
});
