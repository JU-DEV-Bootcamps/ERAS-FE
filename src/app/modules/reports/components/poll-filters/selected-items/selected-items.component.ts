import { Component, input } from '@angular/core';

@Component({
  selector: 'app-selected-items',
  templateUrl: './selected-items.component.html',
  styleUrl: './selected-items.component.scss',
})
export class SelectedItemsComponent {
  items = input<(string | undefined)[]>();
}
