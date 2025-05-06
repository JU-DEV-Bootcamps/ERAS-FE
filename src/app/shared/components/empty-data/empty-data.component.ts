import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-data',
  imports: [],
  templateUrl: './empty-data.component.html',
  styleUrl: './empty-data.component.css',
})
export class EmptyDataComponent {
  @Input() title = '';
  @Input() description = 'No data loaded.';
}
