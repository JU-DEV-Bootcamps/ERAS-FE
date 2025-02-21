import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

@Component({
  selector: 'app-modal-variable',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './modal-variable.component.html',
  styleUrl: './modal-variable.component.css',
})
export class ModalVariableComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalVariableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
