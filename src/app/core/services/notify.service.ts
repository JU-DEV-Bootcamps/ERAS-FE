import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { GENERAL_MESSAGES } from '@core/constants/messages';
import { MODAL_DEFAULT_CONF } from '@core/constants/modal';

import { ModalComponent } from '@shared/components/modals/modal-dialog/modal-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  private readonly dialog = inject(MatDialog);

  error(message: string) {
    const msg = typeof message === 'string' ? message : 'Unknown error';
    this.openDialog(msg, false);
  }

  success(message: string) {
    this.openDialog(message, true);
  }

  openDialog(message: string, isSuccess: boolean) {
    this.dialog.open(ModalComponent, {
      ...MODAL_DEFAULT_CONF,
      data: {
        type: isSuccess ? 'success' : 'error',
        isSuccess: isSuccess,
        title: isSuccess
          ? GENERAL_MESSAGES.SUCCESS_TITLE
          : GENERAL_MESSAGES.ERROR_TITLE,
        success: {
          details: message,
        },
        error: {
          title: GENERAL_MESSAGES.ERROR_TITLE,
          details: [message],
          message: message,
        },
        details: [message],
      },
    });
  }
}
