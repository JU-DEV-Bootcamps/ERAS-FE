import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, filter, tap } from 'rxjs';
import { RISK_COLORS, RiskColorType } from '@core/constants/riskLevel';
import { CohortModel } from '@core/models/cohort.model';
import { RiskStudentDetailType } from '../../../../core/models/types/risk-students-detail.type';
import { HeatMapService } from '@core/services/api/heat-map.service';
import { CohortService } from '@core/services/api/cohort.service';

@Component({
  selector: 'app-modal-risk-students-cohort',
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatMenuModule,
    MatDialogActions,
    MatDialogContent,
    MatProgressBarModule,
  ],
  templateUrl: './modal-risk-students-cohort.component.html',
  styleUrl: './modal-risk-students-cohort.component.scss',
})
export class ModalRiskStudentsCohortComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ModalRiskStudentsCohortComponent>);
  heatMapService = inject(HeatMapService);
  cohortService = inject(CohortService);

  riskStudentsDetail: RiskStudentDetailType[] = [];
  cohorts: CohortModel[] = [];

  columns = ['studentId', 'studentName', 'riskLevel', 'actions'];

  form = new FormGroup({
    cohort: new FormControl<string | null>(null, Validators.required),
    limit: new FormControl<number | null>(null, [
      Validators.pattern('^[1-9]*$'),
      Validators.min(1),
    ]),
  });

  isLoading = false;
  get formLimit() {
    return this.form.get('limit');
  }

  ngOnInit(): void {
    this.cohortService.getCohorts().subscribe({
      next: data => (this.cohorts = data.body),
      error: error => console.error('Error fetching cohorts', error),
    });

    this.form.valueChanges
      .pipe(
        filter(() => this.form.valid),
        tap(() => (this.isLoading = true)),
        debounceTime(500)
      )
      .subscribe(formValue => {
        this.findStudentsByCohort(formValue.cohort!, formValue.limit);
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  findStudentsByCohort(cohortId: string, limit?: number | null): void {
    this.isLoading = true;
    this.heatMapService
      .getStudentHeatMapDetailsByCohort(cohortId, limit)
      .subscribe({
        next: data => {
          this.riskStudentsDetail = data;
          this.isLoading = false;
        },
        error: error => {
          console.error('Error fetching risk student details by cohort', error);
          this.isLoading = false;
        },
      });
  }

  getColorRisk(riskLevel: RiskColorType) {
    return RISK_COLORS[riskLevel] || RISK_COLORS.default;
  }
}
