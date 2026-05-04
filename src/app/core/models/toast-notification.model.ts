export type ToastNotificationType = 'success' | 'error';

export interface ToastNotificationData {
  message: string;
  title: string;
  type: ToastNotificationType;
}
