import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { HeatmapService } from '../../../core/services/heatmap.service';

@Component({
  selector: 'app-summary-heatmap',
  imports: [
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './summary-heatmap.component.html',
  styleUrl: './summary-heatmap.component.css',
})
export class SummaryHeatmapComponent {
  public chartOptions: ApexOptions = {};
  private heatMapData = null;
  public pollId = localStorage.getItem('pollUUID') || 'notFound';

  public componentsSummary: {
    componentName: string;
    variables: { varName: string; scoreAverage: number }[];
  }[] = [];

  constructor(private heatmapService: HeatmapService) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.heatmapService.getSummaryData(this.pollId).subscribe((data: any) => {
      this.heatMapData = data.body;
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
          categories: [''],
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: function (seriesName: string, opts?: any): string {
                const rowIdx = opts.seriesIndex;
                const colIdx = opts.dataPointIndex;
                const grid = opts.series;

                if (grid[rowIdx][colIdx] === -1) {
                  return '';
                }
                return 'Average Risk Level:';
              },
            },
          },
        },
      };
    });
  }
}
