import { Component, input, OnInit } from '@angular/core';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { RISK_COLORS, RISK_LABELS } from '../../../../core/constants/riskLevel';
import { ChartBase } from '../abstract-chart';

@Component({
  selector: 'app-pie-chart',
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css',
})
export class PieChartComponent extends ChartBase implements OnInit {
  public chartOptions: ApexOptions = {};
  seriesY = input([12, 5, 3, 2, 12, 6]);
  colors = input(Object.values(RISK_COLORS));
  categoriesX = input(Object.values(RISK_LABELS));

  constructor() {
    super();
  }
  ngOnInit(): void {
    this.chartOptions = {
      series: this.seriesY(),
      chart: {
        type: 'donut',
      },
      dataLabels: { enabled: false },
      labels: this.categoriesX(),
      colors: this.colors(),
      legend: { show: false },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: { show: false },
          },
        },
      ],
    };
  }
}
