import { NgClass, NgFor, TitleCasePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { DialogData, DialogType } from './types/dialog';
import { TYPE_ICON } from '@core/constants/messages';

@Component({
  selector: 'app-modal',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatIcon,
    NgFor,
    NgClass,
    TitleCasePipe,
  ],
  templateUrl: './modal-dialog.component.html',
  styleUrl: './modal-dialog.component.scss',
})
export class ModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  doAction() {
    if (this.data.action) {
      this.data.action.action();
    } else {
      console.warn('No action function provided');
    }
    this.dialogRef.close();
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

  getTypeIcon(type: DialogType): string {
    return TYPE_ICON[type] ?? '';
  }
}
