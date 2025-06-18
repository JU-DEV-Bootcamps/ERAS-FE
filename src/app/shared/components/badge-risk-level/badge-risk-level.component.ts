import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EmptyDataComponent } from '../empty-data/empty-data.component';
import {
  getRiskColor,
  getRiskTextColor,
} from '../../../core/constants/riskLevel';

@Component({
  selector: 'app-badge-risk-level',
  templateUrl: './badge-risk-level.component.html',
  styleUrl: './badge-risk-level.component.scss',
  imports: [MatIconModule, CommonModule, EmptyDataComponent],
})
export class BadgeRiskComponent {
  @Input() riskLevel: number | undefined;

  getRiskColor(riskLevel: number): string {
    return getRiskColor(riskLevel);
  }

  getTextRiskColor(riskLevel: number): string {
    return getRiskTextColor(riskLevel);
  }
}
