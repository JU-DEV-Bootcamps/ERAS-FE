import { Component, inject, Input } from '@angular/core';
import { ActionHandlerFactory } from '@core/factories/action-handler/action-handler.factory';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ACTION_CONTEXT } from '@core/factories/action-handler/models/action-context.token';
import { ActionButton } from '@core/factories/action-handler/models/action-button.model';

@Component({
  selector: 'app-group-action-button',
  imports: [MatIcon, MatTooltip],
  templateUrl: './group-action-button.component.html',
  styleUrl: './group-action-button.component.scss',
})
export class GroupActionButtonComponent {
  @Input({ required: true }) actions!: ActionButton[];

  private readonly factory = inject(ActionHandlerFactory);
  private readonly context = inject(ACTION_CONTEXT);

  onActionClick(action: ActionButton) {
    const handler = this.factory.createAction(
      action.type,
      this.context.injector
    );

    handler.executeAction();
  }
}
