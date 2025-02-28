import { Component, input } from '@angular/core';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { riskLevels } from '../constants';

@Component({
  selector: 'app-pie-chart',
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css',
})
export class PieChartComponent {
  public chartOptions: ApexOptions = {};
  series = input([12, 5, 3, 2, 1]);
  categories = input(riskLevels.map(r => r.name));
  colors = input(riskLevels.map(r => r.color));
  constructor() {
    this.chartOptions = {
      series: this.series(),
      chart: {
        type: 'donut',
      },
      labels: this.categories(),
      colors: this.colors(),
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }
}
