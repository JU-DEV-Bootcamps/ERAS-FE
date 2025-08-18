import { Component } from '@angular/core';
import { ModalComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import {
  DialogData,
  DialogType,
} from '../shared/components/modal-dialog/types/dialog';
import { TYPE_TITLE } from '../core/constants/messages';
import { MatDialog } from '@angular/material/dialog';
import { MODAL_DEFAULT_CONF } from '../core/constants/modal';

@Component({
  selector: 'app-test-component',
  imports: [],
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.css',
})
export class TestComponent {
  constructor(private dialog: MatDialog) {}
  openDialog(type: DialogType, descriptionMessage: string) {
    this.dialog.open(ModalComponent, {
      ...MODAL_DEFAULT_CONF,
      data: {
        type,
        title: TYPE_TITLE[type],
        data: {
          title: TYPE_TITLE[type],
          details: ['Detail 1', 'Detail 2'],
          message: descriptionMessage,
        },
        //deleteConfirmFunction: deleteConfirmFunction,
      } as DialogData,
    });
  }
}
