import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { readOnlyColumns } from '../list/constants/list';

@Component({
  selector: 'app-edit-object-modal',
  templateUrl: './modal-edit-object.component.html',
  imports: [
    CommonModule,
    FormsModule,
    MatButton,
    MatLabel,
    MatFormField,
    MatInput,
    MatDialogModule,
  ],
})
export class EditObjectModalComponent<T extends object> {
  objectCopy: T;

  constructor(
    public dialogRef: MatDialogRef<EditObjectModalComponent<T>>,
    @Inject(MAT_DIALOG_DATA) public data: T
  ) {
    this.objectCopy = { ...data };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.objectCopy);
  }

  objectKeys(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }

  isReadOnly(key: keyof T) {
    return readOnlyColumns.includes(key.toString());
  }
}
