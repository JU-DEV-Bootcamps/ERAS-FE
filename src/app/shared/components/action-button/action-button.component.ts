import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionButton } from '../list/types/action';
import { EventAction } from '../../events/load';

@Component({
  selector: 'app-action-button',
  imports: [],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.css',
})
export class ActionButtonComponent {
  @Input() actionButton: ActionButton = {
    type: 'none',
    label: '',
  };
  @Input() data: unknown = {};
  @Output() actionCalled = new EventEmitter<EventAction>();

  onButtonClick(event: Event) {
    this.actionCalled.emit({ event, data: this.data });
  }
}
