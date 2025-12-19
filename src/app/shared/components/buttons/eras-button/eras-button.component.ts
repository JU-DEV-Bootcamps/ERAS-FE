import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-eras-button',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './eras-button.component.html',
})
export class ErasButtonComponent {
  clickButton = output<boolean>();
  textButton = input<string>('Default Button Text');
  iconButton = input<string>('');
}
