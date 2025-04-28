import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionButton } from '../list/types/action';

@Component({
  selector: 'app-action-button',
  imports: [],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.css',
})
export class ActionButtonComponent {
  @Input() data: ActionButton = {
    type: 'none',
    label: '',
  };
  @Output() actionCalled = new EventEmitter<unknown>();

  onButtonClick() {
    console.log("onButtonClick");

    this.actionCalled.emit(this.data);
  }
}
