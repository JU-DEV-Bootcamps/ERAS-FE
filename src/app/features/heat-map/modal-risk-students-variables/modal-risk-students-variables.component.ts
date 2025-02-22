import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { StudentData } from '../types/risk-students-variables.type';
@Component({
  selector: 'app-modal-risk-students-variables',
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './modal-risk-students-variables.component.html',
  styleUrl: './modal-risk-students-variables.component.css',
})
export class ModalRiskStudentsVariablesComponent {
  private formBuilder = inject(FormBuilder);
  public filterForm = this.formBuilder.group({
    selectComponent: [Validators.required],
    selectVariables: [Validators.required],
  });
  constructor(
    public dialogRef: MatDialogRef<ModalRiskStudentsVariablesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudentData[]
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
