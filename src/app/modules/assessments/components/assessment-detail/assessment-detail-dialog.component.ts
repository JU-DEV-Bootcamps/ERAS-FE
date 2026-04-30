import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AssessmentStatusBadgeComponent } from '../assessment-list/assessment-status-badge/assessment-status-badge.component';
import { AssessmentRowViewModel } from '../assessment-list/assessment-list.component';

@Component({
  selector: 'app-assessment-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    AssessmentStatusBadgeComponent,
  ],
  templateUrl: './assessment-detail-dialog.component.html',
  styleUrl: './assessment-detail-dialog.component.scss',
})
export class AssessmentDetailDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<AssessmentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssessmentRowViewModel
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onCreateIntervention(): void {
    // TODO: implement once Create Intervention screen is available
    this.dialogRef.close({
      action: 'createIntervention',
      assessment: this.data,
    });
  }
}
