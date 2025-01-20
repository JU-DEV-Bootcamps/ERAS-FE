import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  generateMockupQuestions,
  generateMockupAnswers,
} from './services/data.generator';
import { adaptAnswers, orderAnswers } from './services/data.adapter';

import { ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './heat-map.component.html',
  styleUrl: './heat-map.component.css',
})
export class HeatMapComponent {
  public chartOptions: ApexOptions;

  constructor() {
    const questions = generateMockupQuestions('ACADEMIC');
    const rawAnswers = generateMockupAnswers(questions);
    const answers = adaptAnswers(questions, rawAnswers);
    const orderedAnswers = orderAnswers(answers, true);

    this.chartOptions = {
      series: orderedAnswers!,
      chart: {
        type: 'heatmap',
        height: 500,
        width: 800,
      },
      title: {
        text: questions.component,
      },
      xaxis: {
        categories: [''],
      },
      plotOptions: {
        heatmap: {
          distributed: true,
          colorScale: {
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
    };
  }
}
