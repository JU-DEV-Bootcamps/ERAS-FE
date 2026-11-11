import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDeleteConfirmationComponent } from './modal-delete-confirmation.component';
import { DeleteModalData } from './modal-delete-confirmation.interface';
import { CONFIRMATION_DIALOG_MAX_WIDTH } from '@core/utils/dialogs/responsive-dialog-size';

@Injectable({ providedIn: 'root' })
export class ModalDeleteConfirmationService {
  dialog = inject(MatDialog);

  confirmDelete(config: DeleteModalData) {
    return this.dialog.open(ModalDeleteConfirmationComponent, {
      data: config,
      autoFocus: false,
      width: '418px',
      maxWidth: CONFIRMATION_DIALOG_MAX_WIDTH,
      panelClass: 'delete-confirmation-modal',
    });
  }
}
