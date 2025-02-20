import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Conf, SurveyKind } from '../types/data.generator';
import {
  generateMockupAnswers,
  generateMockupQuestions,
} from '../services/data.generator';
import { adaptComponent, adaptToHeatMap } from '../services/summary.adapter';
import { orderAnswers } from '../services/data.adapter';

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
  public chartOptions: ApexOptions;
  public surveyKinds: SurveyKind[] = [
    'ACADEMIC',
    'INDIVIDUAL',
    'FAMILIAR',
    'SOCIAL',
  ];

  public componentsSummary: {
    componentName: string;
    variables: { varName: string; scoreAverage: number }[];
  }[] = [];

  constructor() {
    const baseConf: Conf = {
      multiple_answers_action: 'AVG',
      min_answers: 1,
      max_answers: 7,
      min_value: 1,
      max_value: 5,
      questions: 10,
      cantStudents: 25,
    };
    this.surveyKinds.forEach(surveyKind => {
      const conf = { ...baseConf };
      const mockupQuestions = generateMockupQuestions(surveyKind, conf);
      const rawAnswers = generateMockupAnswers(mockupQuestions, conf);
      this.componentsSummary.push(adaptComponent(mockupQuestions, rawAnswers));
    });

    const componentsHeatMap = orderAnswers(
      adaptToHeatMap(this.componentsSummary),
      true
    );
    console.log(componentsHeatMap);

    this.chartOptions = {
      series: componentsHeatMap,
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
                to: 5,
                color: '#FF0000',
                foreColor: '#FFFFFF',
                name: 'High Risk',
              },
            ],
          },
        },
      },
      tooltip: {
        style: {
          fontSize: '1rem', // Adjust the font size as needed
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
            return 'Score:' + val.toString();
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
              const xValue = opts.w.globals.seriesX[rowIdx][colIdx];
              return xValue + ' >';
            },
          },
        },
      },
    };
  }
}
