import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AnswerDetail } from '@core/models/summary.model';

@Component({
  selector: 'app-tooltip-chart',
  imports: [CommonModule],
  templateUrl: './tooltip-chart.component.html',
})
export class TooltipChartComponent {
  @Input() value!: string;
  @Input() category!: string;
  @Input() emails!: string[];
  @Input() answers!: AnswerDetail[];
}
