import { Component, inject, input, OnInit, OnChanges } from '@angular/core';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { HeatMapService } from '../../../core/services/heat-map.service';
import { ChartOptions } from '../util/heat-map-config';

@Component({
  selector: 'app-heat-map',
  imports: [NgApexchartsModule],
  templateUrl: './heat-map.component.html',
  styleUrl: './heat-map.component.css',
})
export class HeatMapComponent implements OnInit, OnChanges {
  pollId = input<string>();
  heatmapService = inject(HeatMapService);
  chartOptions: ApexOptions = {};

  ngOnInit() {
    this.getHeatMap();
  }

  ngOnChanges() {
    this.getHeatMap();
  }

  getHeatMap() {
    this.heatmapService
      .getSummaryData(this.pollId()!)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .subscribe((data: any) => {
        this.chartOptions = {
          ...ChartOptions,
          series: data.body.series,
        };
      });
  }
}
