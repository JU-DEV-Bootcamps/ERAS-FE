import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'eras-button',
  imports: [MatButtonModule],
  templateUrl: './eras-button.component.html',
})
export class ErasButtonComponent {
  clickButton = output<boolean>();
  textButton = input<string>('Default Button Text');
}
