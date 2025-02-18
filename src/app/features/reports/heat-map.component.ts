import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { NgApexchartsModule } from 'ng-apexcharts';

import {
  generateMockupQuestions,
  generateMockupAnswers,
} from './services/data.generator';
import { adaptAnswers, orderAnswers } from './services/data.adapter';

import { ApexOptions } from 'ng-apexcharts';
import { Conf, SurveyKind, MockUpAnswers } from './types/data.generator';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.css'],
})
export class HeatMapComponent {
  public myForm: FormGroup;
  public chartOptions: ApexOptions;
  public surveyKinds: SurveyKind[] = [
    'ACADEMIC',
    'INDIVIDUAL',
    'FAMILIAR',
    'SOCIAL',
  ];
  private defaultSurvey = this.surveyKinds[0];
  public surveyKind = this.defaultSurvey;
  public mockupAnswers: MockUpAnswers = {
    ACADEMIC: null,
    INDIVIDUAL: null,
    FAMILIAR: null,
    SOCIAL: null,
  };
  public form: Record<string, string> = {
    variable: '',
  };

  //@ts-ignore
  public questions: Question[] = [] as Question[];
  //@ts-ignore
  public selectedQuestions: Question[] = [] as Question[];
  //@ts-ignore
  public selectedSurveyKind = this.defaultSurvey;

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

    this.surveyKinds.forEach(surveyKind => {
      const conf = { ...baseConf };
      const mockupQuestions = generateMockupQuestions(surveyKind, conf);
      const rawAnswers = generateMockupAnswers(mockupQuestions, conf);
      const answers = adaptAnswers(mockupQuestions, rawAnswers);
      const orderedAnswers = orderAnswers(answers, true);

      this.mockupAnswers[surveyKind] = {
        questions: mockupQuestions,
        series: orderedAnswers,
      };
    });
    const selectedSurveyKind = this.selectedSurveyKind;

    this.questions =
      this.mockupAnswers[selectedSurveyKind]!.questions.questions;
    this.chartOptions = {
      series: this.mockupAnswers[selectedSurveyKind]!.series.filter(
        s =>
          this.selectedQuestions.length === 0 ||
          this.selectedQuestions.includes(s.name)
      ),
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
        text: selectedSurveyKind,
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

    this.myForm = this.initForm();
  }

  initForm() {
    this.selectedQuestions = this.questions.map(q => q.description);

    const form = new FormGroup({
      selectedQuestions: new FormControl(this.selectedQuestions, [
          Validators.required,
          this.arrayValidator
      ]),
      selectedSurveyKind: new FormControl(
        this.defaultSurvey,
        Validators.required
      ),
    });

    form.get('selectedQuestions')?.valueChanges.subscribe(value => {
      this.selectedQuestions = value!;
      this.updateChart();
    });
    form.get('selectedSurveyKind')?.valueChanges.subscribe(value => {
      this.selectedSurveyKind = value ?? this.defaultSurvey;
      this.updateChart();
    });

    return form;
  }

  updateChart() {
    if (this.myForm.valid) {
      const selectedSurveyKind = this.myForm.get('selectedSurveyKind')?.value as SurveyKind;

      this.chartOptions = {
        ...this.chartOptions,
        series: this.mockupAnswers[selectedSurveyKind]!.series.filter(
          s =>
            this.selectedQuestions.length === 0 ||
            this.selectedQuestions.includes(s.name)
        ),
        title: {
          text: selectedSurveyKind,
        },
      };
    } else {
      console.log('Form is invalid. Please fill in all required fields.');
    }
  }

  arrayValidator(control: FormControl): Record<string, boolean> | null {
    const value = control.value;

    if (value.length === 0) {
      return { invalidDomain: true };
    }

    return null;
  }
}
