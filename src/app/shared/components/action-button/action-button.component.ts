import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionData } from '../list/types/action';
import { EventAction } from '../../events/load';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-action-button',
  imports: [MatButton],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.css',
})
export class ActionButtonComponent {
  @Input() actionData: ActionData = {
    columnId: '',
    text: '',
    label: '',
  };
  @Input() item: unknown = {};
  @Output() actionCalled = new EventEmitter<EventAction>();

  onButtonClick(event: Event) {
    if (this.actionData.label) {
      this.actionCalled.emit({
        event,
        data: this.actionData,
        item: this.item,
      });
    }
  }
}
