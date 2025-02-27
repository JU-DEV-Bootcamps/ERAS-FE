import { Component } from '@angular/core';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-summary-survey',
  imports: [NgApexchartsModule],
  templateUrl: './summary-survey.component.html',
  styleUrl: './summary-survey.component.css',
})
export class AppComponent {
  public chartOptions: ApexOptions = {};

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'basic',
          data: [12, 5, 3, 2, 1],
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ['Critic', 'High', 'Medium', 'Low', 'No Risk'],
      },
    };
  }
}
