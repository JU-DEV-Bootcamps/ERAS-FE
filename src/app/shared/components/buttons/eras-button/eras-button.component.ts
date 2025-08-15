import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'eras-button',
  imports: [MatButtonModule],
  template: `
    <button mat-flat-button type="button" (click)="clickButton.emit(true)">
      {{ textButton() }}
    </button>
  `,
})
export class ErasButtonComponent {
  clickButton = output<boolean>();
  textButton = input<string>('Default Button Text');
}
