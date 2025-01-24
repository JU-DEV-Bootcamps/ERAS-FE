import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  generateMockupQuestions,
  generateMockupAnswers,
} from './services/data.generator';
import { adaptAnswers, orderAnswers } from './services/data.adapter';

import { ApexOptions } from 'ng-apexcharts';
import { Conf, SurveyKind, MockUpAnswers } from './types/data.generator';

import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [NgApexchartsModule, MatSelectModule],
  templateUrl: './heat-map.component.html',
  styleUrl: './heat-map.component.css',
})
export class HeatMapComponent {
  public chartOptions: ApexOptions;
  public mockupAnswers: MockUpAnswers = {
    ACADEMIC: null,
    INDIVIDUAL: null,
    FAMILIAR: null,
    SOCIAL: null,
  };

  constructor() {
    const baseConf: Conf = {
      multiple_answers_action: 'AVG',
      min_answers: 1,
      max_answers: 10,
      min_value: 1,
      max_value: 5,
      questions: 10,
      cantStudents: 25,
    };
    const surveyKinds: SurveyKind[] = [
      'ACADEMIC',
      'INDIVIDUAL',
      'FAMILIAR',
      'SOCIAL',
    ];
    const defaultSurvey = surveyKinds[0];

    surveyKinds.forEach(surveyKind => {
      const conf = { ...baseConf };
      const questions = generateMockupQuestions(surveyKind, conf);
      const rawAnswers = generateMockupAnswers(questions, conf);
      const answers = adaptAnswers(questions, rawAnswers);
      const orderedAnswers = orderAnswers(answers, true);

      this.mockupAnswers[surveyKind] = {
        questions,
        series: orderedAnswers,
      };
    });

    this.chartOptions = {
      series: this.mockupAnswers[defaultSurvey]!.series,
      chart: {
        type: 'heatmap',
      },
      title: {
        text: this.mockupAnswers[defaultSurvey]!.questions.surveyKind,
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
                color: '#90EE90',
                foreColor: '#FFFFFF',
                name: 'Low-Medium Risk',
              },
              {
                from: 4,
                to: 6,
                color: '#E5E500',
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

  handleChange(surveyKind: SurveyKind): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: this.mockupAnswers[surveyKind]!.series,
      title: {
        text: this.mockupAnswers[surveyKind]!.questions.surveyKind,
      },
    };
  }
}
