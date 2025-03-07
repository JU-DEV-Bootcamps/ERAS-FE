import { Component, input } from '@angular/core';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { RISK_COLORS, RISK_LABELS } from '../../../../core/constants/riskLevel';
import { ChartBase } from '../abstract-chart';

@Component({
  selector: 'app-bar-chart',
  imports: [NgApexchartsModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css',
})
export class BarChartComponent extends ChartBase {
  public chartOptions: ApexOptions = {};
  seriesY = input([12, 5, 3, 2, 12, 6]);
  colors = input(Object.values(RISK_COLORS));
  categoriesX = input(Object.values(RISK_LABELS));
  constructor() {
    super();
    this.chartOptions = {
      chart: {
        type: 'bar',
        height: 200,
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      series: [
        {
          data: this.loadDataFromInput(),
        },
      ],
    };
  }
}
