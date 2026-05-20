import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDeleteConfirmationComponent } from './modal-delete-confirmation.component';
import { DeleteModalData } from './modal-delete-confirmation.interface';

@Injectable({ providedIn: 'root' })
export class ModalDeleteConfirmationService {
  dialog = inject(MatDialog);

  confirmDelete(config: DeleteModalData) {
    return this.dialog.open(ModalDeleteConfirmationComponent, {
      data: config,
      autoFocus: false,
      width: '418px',
      panelClass: 'delete-confirmation-modal',
    });
  }
}
