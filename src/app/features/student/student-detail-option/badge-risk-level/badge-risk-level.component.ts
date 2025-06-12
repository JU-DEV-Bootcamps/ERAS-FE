import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EmptyDataComponent } from '../../../../shared/components/empty-data/empty-data.component';
import { StudentRiskResponse } from '../../../../core/models/cohort.model';
import {
  RISK_COLORS,
  RiskColorType,
} from '../../../../core/constants/riskLevel';

@Component({
  selector: 'app-badge-risk-level',
  templateUrl: './badge-risk-level.component.html',
  styleUrl: './badge-risk-level.component.scss',
  imports: [MatIconModule, CommonModule, EmptyDataComponent],
})
export class BadgeRiskComponent {
  @Input() element: StudentRiskResponse | undefined;

  getColorRisk(riskLevel: RiskColorType) {
    return RISK_COLORS[riskLevel] || RISK_COLORS.default;
  }
}
