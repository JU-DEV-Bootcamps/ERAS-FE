import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatIcon,
    NgFor,
    NgClass,
    NgIf,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportDialogComponent {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ImportDialogComponent>);
  private router = inject(Router);

  @Output()
  fileChangedEvent = new EventEmitter<Event>();

  closeDialog(): void {
    this.dialogRef.close();
  }
  closeAndGetNewFile() {
    this.dialogRef.close(true);
  }
}
