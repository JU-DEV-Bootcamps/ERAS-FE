import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { MatButton, MatButtonModule } from '@angular/material/button';
import { EventAction } from '@core/models/load';
import { ActionData } from '@shared/components/list/types/action';

@Component({
  selector: 'app-action-button',
  imports: [MatButton, NgTemplateOutlet, MatButtonModule],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss',
})
export class ActionButtonComponent {
  @Input() actionData: ActionData = {
    columnId: '',
    text: '',
    label: '',
    id: '',
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
