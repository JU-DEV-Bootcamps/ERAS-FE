import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { TYPE_TITLE } from '@core/constants/messages';
import { MODAL_DEFAULT_CONF } from '@core/constants/modal';
import { ModalComponent } from '@shared/components/modals/modal-dialog/modal-dialog.component';
import {
  DialogData,
  DialogType,
} from '@shared/components/modals/modal-dialog/types/dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialog: MatDialog = inject(MatDialog);

  openDialog(
    descriptionMessage: string,
    type: DialogType,
    extraMessage?: string
  ): void {
    const buttonElement = document.activeElement as HTMLElement;
    const dialogData: DialogData = {
      type,
      title: TYPE_TITLE[type],
      message: extraMessage,
      details: [descriptionMessage],
    };
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(ModalComponent, {
      ...MODAL_DEFAULT_CONF,
      data: dialogData,
    });
  }
}
