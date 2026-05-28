import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RISK_COLORS } from '@core/constants/riskLevel';
import { AnswerDetail } from '@core/models/summary.model';

export type AnswerDetailWithColor = AnswerDetail & {
  riskColor: string;
};

@Component({
  selector: 'app-tooltip-chart-v2',
  imports: [CommonModule],
  templateUrl: './tooltip-chart-v2.component.html',
})
export class TooltipChartV2Component implements OnInit {
  @Input() value!: string;
  @Input() category!: string;
  @Input() emails?: string[];
  @Input() answers?: AnswerDetail[];
  answersWithColor: AnswerDetailWithColor[] = [];

  ngOnInit() {
    this.answersWithColor =
      this.answers?.map(answer => ({
        ...answer,
        riskColor: RISK_COLORS[answer.riskLevel ?? 0],
      })) ?? [];
  }
}
