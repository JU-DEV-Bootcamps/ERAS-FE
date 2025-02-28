import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-student-detail',
  imports: [NgApexchartsModule],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
})
export class StudentDetailComponent {
  public chartOptions: ApexOptions = {
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
        data: [
          {
            x: 'Socioeconómico',
            y: 10,
            fillColor: '#E68787',
          },
          {
            x: 'Individual',
            y: 18,
            fillColor: '#E8B079',
          },
          {
            x: 'Academico',
            y: 13,
            fillColor: '#E5E880',
          },
          {
            x: 'Familiar',
            y: 13,
            fillColor: '#DFF8E3',
          },
        ],
      },
    ],
  };

  public risk_by_month_chart: ApexOptions = {
    series: [],
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
      text: '',
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
              to: 2,
              color: '#008000',
              foreColor: '#FFFFFF',
              name: 'Low Risk',
            },
            {
              from: 2,
              to: 4,
              color: '#3CB371',
              foreColor: '#FFFFFF',
              name: 'Low-Medium Risk',
            },
            {
              from: 4,
              to: 6,
              color: '#F0D722',
              foreColor: '#FFFFFF',
              name: 'Medium Risk',
            },
            {
              from: 6,
              to: 8,
              color: '#FFA500',
              foreColor: '#FFFFFF',
              name: 'Medium-High Risk',
            },
            {
              from: 8,
              to: 100,
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
            return seriesName;
          },
        },
      },
    },
  };
}
