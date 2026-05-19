import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DeleteModalData } from './modal-delete-confirmation.interface';

@Component({
  selector: 'app-modal-delete',
  imports: [MatIconModule],
  templateUrl: './modal-delete-confirmation.component.html',
  styleUrl: './modal-delete-confirmation.component.scss',
})
export class ModalDeleteConfirmationComponent {
  data = inject<DeleteModalData>(MAT_DIALOG_DATA);

  dialogRef = inject(MatDialogRef<ModalDeleteConfirmationComponent>);
  isLoading = signal(false);
  error = signal<string | null>(null);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
