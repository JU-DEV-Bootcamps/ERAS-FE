import { Injectable, Injector } from '@angular/core';
import { ActionType } from './models/action-type.enum';
import { ActionHandler } from './models/action-handler.interface';
import { FullscreenAction } from './actions/fullscreen.action';

@Injectable({ providedIn: 'root' })
export class ActionHandlerFactory {
  createAction(type: ActionType, injector: Injector): ActionHandler {
    switch (type) {
      case ActionType.FULLSCREEN:
        return injector.get(FullscreenAction);
      default:
        throw new Error(`Unsupported action type: ${type}`);
    }
  }
}
