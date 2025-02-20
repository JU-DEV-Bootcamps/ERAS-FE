import { Component, inject, model, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {
  ComponentValueType,
  RiskStudentDetailType,
} from '../types/risk-students-detail.type';
import { HeatMapService } from '../../../core/services/heat-map.service';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-modal-risk-students-detail',
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatChipsModule,
  ],
  templateUrl: './modal-risk-students-detail.component.html',
  styleUrl: './modal-risk-students-detail.component.scss',
})
export class ModalRiskStudentsDetailComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ModalRiskStudentsDetailComponent>);
  readonly data = inject<{ component: ComponentValueType }>(MAT_DIALOG_DATA);
  readonly component = model(this.data.component);

  heatMapService = inject(HeatMapService);

  riskStudentsDetail: RiskStudentDetailType[] = [];

  ngOnInit(): void {
    this.heatMapService
      .getStudentHeatMapDetails(this.component())
      .subscribe(data => {
        this.riskStudentsDetail = data;
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
