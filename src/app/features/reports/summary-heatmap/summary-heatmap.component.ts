import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { ActivatedRoute } from '@angular/router';
import { HeatMapService } from '../../../core/services/heat-map.service';
import { ChartOptions } from '../../cohort/util/heat-map-config';

@Component({
  selector: 'app-summary-heatmap',
  imports: [
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './summary-heatmap.component.html',
  styleUrl: './summary-heatmap.component.css',
})
export class SummaryHeatmapComponent implements OnInit {
  private readonly heatmapService = inject(HeatMapService);
  public chartOptions: ApexOptions = {};
  private pollUuid = '';
  private route = inject(ActivatedRoute);
  private cohortId = '';

  isLoading = true;

  public componentsSummary: {
    componentName: string;
    variables: { varName: string; scoreAverage: number }[];
  }[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cohortId = params['cohortId'] || '0';
      this.pollUuid = params['pollUuid'] || '0';
    });

    this.heatmapService.getSummaryData(this.pollUuid).subscribe(data => {
      this.isLoading = false;
      this.chartOptions = {
        ...ChartOptions,
        series: data.body.series,
      };
    });
  }
}
