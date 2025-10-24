import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tooltip-chart',
  imports: [CommonModule],
  templateUrl: './tooltip-chart.component.html',
})
export class TooltipChartComponent {
  @Input() value!: number;
  @Input() category!: string;
  @Input() emails!: string;
}
