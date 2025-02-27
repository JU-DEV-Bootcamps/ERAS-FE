import { Component } from '@angular/core';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-pie-chart',
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css',
})
export class PieChartComponent {
  public chartOptions: ApexOptions = {};

  constructor() {
    this.chartOptions = {
      series: [12, 5, 3, 2, 1],
      chart: {
        type: 'donut',
      },
      labels: ['Critic', 'High', 'Medium', 'Low', 'No Risk'],
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
