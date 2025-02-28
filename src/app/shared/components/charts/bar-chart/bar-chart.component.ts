import { Component, input } from '@angular/core';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { riskLevels } from '../constants';

@Component({
  selector: 'app-bar-chart',
  imports: [NgApexchartsModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css',
})
export class BarChartComponent {
  public chartOptions: ApexOptions = {};
  series = input([12, 5, 3, 2, 1]);
  categories = input(riskLevels.map(r => r.name));
  colors = input(riskLevels.map(r => r.color));
  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Students answers',
          data: this.series(),
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          colors: {
            backgroundBarColors: this.colors(),
          },
        },
      },
      dataLabels: {
        enabled: true,
      },
      xaxis: {
        categories: this.categories(),
      },
      colors: this.colors(),
    };
  }
}
