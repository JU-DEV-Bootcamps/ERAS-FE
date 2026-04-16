import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chip',
  imports: [],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
})
export class ChipComponent {
  @Input() text!: string;
}
