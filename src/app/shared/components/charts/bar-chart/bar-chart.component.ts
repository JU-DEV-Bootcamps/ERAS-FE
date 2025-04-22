import { Component, input, OnInit } from '@angular/core';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { RISK_LABELS } from '../../../../core/constants/riskLevel';
import { ChartBase } from '../abstract-chart';

@Component({
  selector: 'app-bar-chart',
  imports: [NgApexchartsModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css',
})
export class BarChartComponent extends ChartBase implements OnInit {
  public chartOptions: ApexOptions = {};
  seriesY = input([1]);
  colors = input([]);
  categoriesX = input(Object.values(RISK_LABELS));
  constructor() {
    super();
  }
  ngOnInit(): void {
    this.chartOptions = {
      chart: {
        type: 'bar',
        height: 500,
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      series: [
        {
          data: this.loadDataFromInput(
            this.categoriesX(),
            this.seriesY(),
            this.colors()
          ),
        },
      ],
    };
  }
}
