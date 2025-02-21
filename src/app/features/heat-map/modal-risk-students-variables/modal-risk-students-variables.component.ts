import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { StudentData } from '../types/risk-students-variables.type';
@Component({
  selector: 'app-modal-risk-students-variables',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './modal-risk-students-variables.component.html',
  styleUrl: './modal-risk-students-variables.component.css',
})
export class ModalRiskStudentsVariablesComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalRiskStudentsVariablesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudentData[]
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
