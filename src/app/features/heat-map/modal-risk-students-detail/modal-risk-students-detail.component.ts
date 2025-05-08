import { Component, inject, OnInit } from '@angular/core';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  Components,
  ComponentValueType,
  RiskStudentDetailType,
} from '../types/risk-students-detail.type';
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
import { RISK_COLORS, RiskColorType } from '../../../core/constants/riskLevel';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, filter, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { HeatMapService } from '../../../core/services/api/heat-map.service';

@Component({
  selector: 'app-modal-risk-students-detail',
  imports: [
    MatButtonModule,
    MatDialogModule,
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
    limit: new FormControl<number | null>(null, [
      Validators.pattern('^[1-9]*$'),
      Validators.min(1),
    ]),
  });

  isLoading = false;

  get formLimit() {
    return this.form.get('limit');
  }

  get formComponent() {
    return this.form.get('component');
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        filter(() => {
          const valid =
            this.form.get('component')?.valid && this.form.get('limit')?.valid;

          return valid ?? false;
        }),
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
