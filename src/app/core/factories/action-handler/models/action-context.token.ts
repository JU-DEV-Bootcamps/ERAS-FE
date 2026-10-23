import { InjectionToken, Injector } from '@angular/core';

export interface ActionContext {
  hostElement: HTMLElement;
  injector: Injector;
}

export const ACTION_CONTEXT = new InjectionToken<ActionContext>(
  'ACTION_CONTEXT'
);
