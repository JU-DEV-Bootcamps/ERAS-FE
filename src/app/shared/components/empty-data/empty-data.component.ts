import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-data-message',
  imports: [MatIconModule],
  templateUrl: './empty-data.component.html',
  styleUrl: './empty-data.component.scss',
})
export class EmptyDataComponent {
  @Input() title = '';
  @Input() description = 'No data loaded.';
}
