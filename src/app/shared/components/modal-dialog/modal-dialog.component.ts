import { NgClass, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

export interface DialogData {
  title: string;
  message: string;
  isSuccess: boolean;
  success: {
    details: string;
  };
  error: {
    title: string;
    message: string;
    showMessage: boolean;
    details: string[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteConfirmFunction: any | null;
}
@Component({
  selector: 'app-modal',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatIcon,
    NgFor,
    NgClass,
  ],
  templateUrl: './modal-dialog.component.html',
  styleUrl: './modal-dialog.component.scss',
})
export class ModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  delete() {
    this.data.deleteConfirmFunction();
    this.dialogRef.close();
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
