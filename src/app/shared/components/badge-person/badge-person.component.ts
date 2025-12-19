import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EmptyDataComponent } from '../empty-data/empty-data.component';
import { StudentReportAnswerRiskLevel } from '@core/models/summary.model';
import { getRiskColor, getRiskTextColor } from '@core/constants/riskLevel';

@Component({
  selector: 'app-person-imported',
  templateUrl: './badge-person.component.html',
  styleUrl: './badge-person.component.scss',
  imports: [MatIconModule, CommonModule, EmptyDataComponent],
})
export class BadgeImportedComponent {
  @Input() element: StudentReportAnswerRiskLevel | undefined;

  getRiskColor(riskLevel: number): string {
    return getRiskColor(riskLevel);
  }

  getTextRiskColor(riskLevel: number): string {
    return getRiskTextColor(riskLevel);
  }
}
