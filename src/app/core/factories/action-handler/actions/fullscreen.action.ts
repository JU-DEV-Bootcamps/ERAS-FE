import { Injectable, Inject, signal } from '@angular/core';
import { ActionHandler } from '../models/action-handler.interface';
import { ACTION_CONTEXT } from '../models/action-context.token';

@Injectable()
export class FullscreenAction implements ActionHandler {
  private readonly fullscreen = signal(false);

  constructor(
    @Inject(ACTION_CONTEXT) private context: { hostElement: HTMLElement }
  ) {}

  executeAction() {
    this.fullscreen.update(val => !val);

    const el = this.context.hostElement;

    if (this.fullscreen()) {
      el.classList.add('app-fullscreen');
      document.body.classList.add('no-scroll');
      document.body.classList.add('app-fullscreen-active');
    } else {
      el.classList.remove('app-fullscreen');
      document.body.classList.remove('no-scroll');
      document.body.classList.remove('app-fullscreen-active');
    }
  }
}
