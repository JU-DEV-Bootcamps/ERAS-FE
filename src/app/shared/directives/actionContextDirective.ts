import { Directive, ElementRef, Injector } from '@angular/core';
import { ACTION_CONTEXT } from '../../core/factories/action-handler/models/action-context.token';
import { FullscreenAction } from '@core/factories/action-handler/actions/fullscreen.action';

@Directive({
  selector: '[appActionContext]',
  providers: [
    FullscreenAction,
    {
      provide: ACTION_CONTEXT,
      useFactory: (el: ElementRef<HTMLElement>, injector: Injector) => ({
        hostElement: el.nativeElement,
        injector,
      }),
      deps: [ElementRef, Injector],
    },
  ],
})
export class ActionContextDirective {}
