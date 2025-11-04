import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { RISK_COLORS, RiskColorType } from '@core/constants/riskLevel';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-risk-students-cohort',
  imports: [
    MatTableModule,
    MatProgressBar,
    MatIcon,
    DecimalPipe,
    MatDialogContent,
  ],
  templateUrl: './student-risklevel-table.component.html',
  styleUrl: './student-risklevel-table.component.scss',
})
export class StudentRisklevelTableComponent {
  readonly dialogRef = inject(MatDialogRef<StudentRisklevelTableComponent>);

  riskStudentsDetail = inject(MAT_DIALOG_DATA);
  router = inject(Router);

  columns = ['studentId', 'studentName', 'riskLevel'];

  closeDialog(): void {
    this.dialogRef.close();
  }

  getColorRisk(riskLevel: string | null) {
    const rl = (parseInt(riskLevel ?? '0') + 1) as RiskColorType;
    return RISK_COLORS[rl] || RISK_COLORS.default;
  }

  hasHighRisk(riskLevel: string | null) {
    return parseInt(riskLevel ?? '0') >= 3 ? RISK_COLORS.default : '';
  }

  redirectToStudentDetail(studentId: string) {
    //TODO: retrieve student id from back
    console.info('retrieve student ' + studentId);
    //window.open(`student-details/${studentId}`, '_blank');
  }
}
