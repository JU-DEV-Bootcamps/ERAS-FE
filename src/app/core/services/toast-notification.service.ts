import { Injectable } from '@angular/core';
import { ToastNotificationData } from '@core/models/toast-notification.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastNotificationService {
  private toastSubject = new BehaviorSubject<ToastNotificationData | null>(
    null
  );
  private defaultClosingTime = 3000;

  toastState$ = this.toastSubject.asObservable();

  showToast(toast: ToastNotificationData, fixed = false) {
    this.toastSubject.next(toast);

    if (!fixed) {
      this.closeToast(this.defaultClosingTime);
    }
  }

  closeToast(delay = 0) {
    setTimeout(() => {
      this.toastSubject.next(null);
    }, delay);
  }
}
