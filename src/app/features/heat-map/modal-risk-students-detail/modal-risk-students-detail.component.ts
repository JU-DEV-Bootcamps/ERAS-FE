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

@Component({
  selector: 'app-modal-risk-students-detail',
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatTableModule,
  ],
  templateUrl: './modal-risk-students-detail.component.html',
  styleUrl: './modal-risk-students-detail.component.scss',
})
export class ModalRiskStudentsDetailComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ModalRiskStudentsDetailComponent>);

  columns = ['studentId', 'studentName', 'riskLevel'];

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
  });

  isLoading = false;

  ngOnInit(): void {
    this.form.valueChanges.subscribe(formValue => {
      this.findStudentsByComponent(formValue.component!);
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  findStudentsByComponent(component: ComponentValueType) {
    this.isLoading = true;
    this.heatMapService.getStudentHeatMapDetails(component).subscribe(data => {
      this.isLoading = false;
      this.riskStudentsDetail = data;
    });
  }

  getColorRisk(riskLevel: RiskColorType) {
    return RISK_COLORS[riskLevel] || RISK_COLORS.default;
  }
}
