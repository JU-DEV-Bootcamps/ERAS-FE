import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { HeatMapService } from '../../../core/services/heat-map.service';
import { ActivatedRoute } from '@angular/router';

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
  private heatMapData = null;
  private route = inject(ActivatedRoute);
  private cohortId = '';
  private days = '';

  isLoading = true;

  public componentsSummary: {
    componentName: string;
    variables: { varName: string; scoreAverage: number }[];
  }[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cohortId = params['cohortId'] || '0';
      this.days = params['days'] || '0';
    });

    this.heatmapService
      .getSummaryDataByCohortAndDays(this.cohortId, this.days)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .subscribe((data: any) => {
        this.heatMapData = data.body;
        this.isLoading = false;
        this.chartOptions = {
          series: data.body.series,
          chart: {
            type: 'heatmap',
            toolbar: {
              show: true,
              tools: {
                download:
                  '<span class="material-icons" style="font-size: 40px; color: var(--primary-color);">download_for_offline</span>',
              },
            },
          },
          title: {
            text: 'Heat Map - All Components',
          },
          xaxis: {
            type: 'category',
            labels: {
              show: false,
            },
            tooltip: {
              enabled: false,
            },
          },
          dataLabels: {
            enabled: false,
          },
          plotOptions: {
            heatmap: {
              distributed: false,
              colorScale: {
                inverse: false,
                ranges: [
                  {
                    from: -1,
                    to: 0,
                    color: '#FFFFFF',
                    foreColor: '#FFFFFF',
                    name: 'No answer',
                  },
                  {
                    from: 0,
                    to: 1,
                    color: '#008000',
                    foreColor: '#FFFFFF',
                    name: 'Low Risk',
                  },
                  {
                    from: 1,
                    to: 2,
                    color: '#3CB371',
                    foreColor: '#FFFFFF',
                    name: 'Low-Medium Risk',
                  },
                  {
                    from: 2,
                    to: 3,
                    color: '#F0D722',
                    foreColor: '#FFFFFF',
                    name: 'Medium Risk',
                  },
                  {
                    from: 3,
                    to: 4,
                    color: '#FFA500',
                    foreColor: '#FFFFFF',
                    name: 'Medium-High Risk',
                  },
                  {
                    from: 4,
                    to: 10,
                    color: '#FF0000',
                    foreColor: '#FFFFFF',
                    name: 'High Risk',
                  },
                ],
              },
            },
          },
          tooltip: {
            x: {
              show: true,
            },
            y: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: function (val: number, opts?: any): string {
                const rowIdx = opts.seriesIndex;
                const colIdx = opts.dataPointIndex;
                const grid = opts.series;

                if (grid[rowIdx][colIdx] === -1) {
                  return '';
                }
                return val.toString();
              },
              title: {
                formatter: function (): string {
                  return 'Average Risk Level:';
                },
              },
            },
            custom: function ({ seriesIndex, dataPointIndex, w }) {
              const dataPoint =
                w.config.series[seriesIndex].data[dataPointIndex];
              const xValue = dataPoint.x;
              const yValue = dataPoint.y;

              return `<div class="apexcharts-tooltip-x" style="font-size: 13px; margin: 4px">${xValue}</div>
              <div style="border-top: 1px solid #ccc;"></div>
              <div class="apexcharts-tooltip-y" style="font-size: 13px; margin: 4px">Average Risk Level: <b>${yValue}</b></div>`;
            },
          },
        };
      });
  }
}
