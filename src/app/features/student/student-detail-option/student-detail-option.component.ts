import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ModalRiskStudentsDetailComponent } from '../../heat-map/modal-risk-students-detail/modal-risk-students-detail.component';
import { ModalRiskStudentsVariablesComponent } from '../../heat-map/modal-risk-students-variables/modal-risk-students-variables.component';
import { DialogRiskVariableData } from '../../heat-map/types/risk-students-variables.type';
import { ModalRiskStudentsCohortComponent } from '../../heat-map/modal-risk-students-cohort/modal-risk-students-cohort.component';

@Component({
  selector: 'app-student-detail-option',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatFormFieldModule,
  ],
  templateUrl: './student-detail-option.component.html',
  styleUrl: './student-detail-option.component.css',
})
export class StudentDetailOptionComponent {
  readonly dialog = inject(MatDialog);
  public modalDataSudentVariable: DialogRiskVariableData =
    {} as DialogRiskVariableData;

  openStudentsDetailsDialog() {
    this.dialog.open(ModalRiskStudentsDetailComponent, {
      width: 'clamp(320px, 40vw, 550px)',
      maxWidth: '80vw',
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
    });
  }

  openDialog() {
    this.dialog.open(ModalRiskStudentsVariablesComponent, {
      width: 'auto',
      maxWidth: '80vw',
      minHeight: '500px',
      maxHeight: '80vh',
      panelClass: 'border-modalbox-dialog',
      data: this.modalDataSudentVariable,
    });
  }

  openStudentsByCohortDialog() {
    this.dialog.open(ModalRiskStudentsCohortComponent, {
      width: 'clamp(320px, 40vw, 550px)',
      maxWidth: '80vw',
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
    });
  }
}
