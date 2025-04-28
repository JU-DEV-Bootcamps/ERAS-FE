import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-action-button',
  imports: [],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.css',
})
export class ActionButtonComponent {
  @Input() data = {};
  @Output() eventEmitter = new EventEmitter<{
    data: unknown;
  }>();

  onButtonClick(event: Event) {
    console.log(event.target);

    this.eventEmitter.emit({ data: this.data });
  }
}
