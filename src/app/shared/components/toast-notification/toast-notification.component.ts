import { animate, style, transition, trigger } from '@angular/animations';
import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ToastNotificationService } from '@core/services/toast-notification.service';

const visibleStyle = { transform: 'translateX(0)' };
const hiddenStyle = { transform: 'translateX(120%)' };
const timing = '0.3s ease';

@Component({
  selector: 'app-toast-notification',
  imports: [AsyncPipe, MatIcon],
  animations: [
    trigger('slideInOutTrigger', [
      transition(':enter', [
        style(hiddenStyle),
        animate(timing, style(visibleStyle)),
      ]),
      transition(':leave', [
        style(visibleStyle),
        animate(timing, style(hiddenStyle)),
      ]),
    ]),
  ],
  templateUrl: './toast-notification.component.html',
  styleUrl: './toast-notification.component.scss',
})
export class ToastNotificationComponent {
  private readonly toastService = inject(ToastNotificationService);

  toast$ = this.toastService.toastState$;

  closeToast() {
    this.toastService.closeToast();
  }
}
