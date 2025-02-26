import { Component, inject, OnInit } from '@angular/core';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {
  Components,
  ComponentValueType,
  RiskStudentDetailType,
} from '../types/risk-students-detail.type';
import { HeatMapService } from '../../../core/services/heat-map.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { RISK_COLORS, RiskColorType } from '../../../core/constants/heat-map';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modal-risk-students-detail',
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
  ],
  templateUrl: './modal-risk-students-detail.component.html',
  styleUrl: './modal-risk-students-detail.component.scss',
})
export class ModalRiskStudentsDetailComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ModalRiskStudentsDetailComponent>);

  columns = ['studentId', 'studentName', 'riskLevel', 'actions'];

  heatMapService = inject(HeatMapService);

  riskStudentsDetail: RiskStudentDetailType[] = [];

  components = [
    {
      name: 'Académico',
      value: Components.ACADEMIC,
    },
    {
      name: 'Individual',
      value: Components.INDIVIDUAL,
    },
    {
      name: 'Familiar',
      value: Components.FAMILIAR,
    },
    {
      name: 'Económico',
      value: Components.SOCIO_ECONOMIC,
    },
  ];

  form = new FormGroup({
    component: new FormControl<ComponentValueType | null>(
      null,
      Validators.required
    ),
    limit: new FormControl<number | null>(null, Validators.min(1)),
  });

  isLoading = false;

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        tap(() => (this.isLoading = true)),
        debounceTime(500)
      )
      .subscribe(formValue => {
        this.findStudentsByComponent(formValue.component!, formValue.limit);
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  findStudentsByComponent(
    component: ComponentValueType,
    limit?: number | null
  ) {
    this.isLoading = true;
    this.heatMapService
      .getStudentHeatMapDetails(component, limit)
      .subscribe(data => {
        this.isLoading = false;
        this.riskStudentsDetail = data;
      });
  }

  getColorRisk(riskLevel: RiskColorType) {
    return RISK_COLORS[riskLevel] || RISK_COLORS.default;
  }
}
