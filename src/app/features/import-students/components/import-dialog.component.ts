import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.css'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogTitle,
    MatDialogContent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportDialogComponent {
  data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ImportDialogComponent>);
  private router = inject(Router);

  closeDialog(): void {
    this.dialogRef.close();
    if (!this.data.isError) this.router.navigate(['/profile']);
  }
}
