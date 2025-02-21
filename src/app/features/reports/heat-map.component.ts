import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { NgApexchartsModule } from 'ng-apexcharts';
import {
  adaptAnswers,
  filterAnswers,
  orderAnswers,
} from './services/data.adapter';

import { ApexOptions } from 'ng-apexcharts';
import {
  SurveyKind,
  MockUpAnswers,
  Question,
  QuestionsSeries,
} from './types/data.generator';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HeatMapService } from './services/heat-map.service';
import { PollService } from '../../core/services/poll.service';
import { Poll } from '../list-students-by-poll/types/list-students-by-poll';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.css'],
})
export class HeatMapComponent implements OnInit {
  public myForm: FormGroup;
  public chartOptions: ApexOptions = {
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
  };;
  public surveyKinds: SurveyKind[] = [
    'ACADEMIC',
    'INDIVIDUAL',
    'FAMILIAR',
    'SOCIAL',
  ];
  private defaultSurvey = this.surveyKinds;
  public surveyKind = this.defaultSurvey;
  public mockupAnswers: MockUpAnswers = {
    ACADEMIC: null,
    INDIVIDUAL: null,
    FAMILIAR: null,
    SOCIAL: null,
  };
  public answers: QuestionsSeries | null = null;
  public questions: Question[] = [] as Question[];
  public selectQuestions: string[] = [];
  public selectSurveyKinds = this.defaultSurvey;
  public pollList = [];

  private heatMapService = inject(HeatMapService);
  private pollService = inject(PollService);

  pollsData: Poll[] = [];
  selectedPoll = this.pollsData[0];

  constructor() {
    this.myForm = this.initForm();
  }

  ngOnInit(): void {
    this.loadPollsList();
    setTimeout(() => {
      this.myForm
        .get('selectQuestions')
        ?.setValue(this.questions.map(q => q.description));
    }, 750);
    this.myForm.valueChanges.subscribe(formValue => {
      this.selectedPoll = this.pollsData.filter(
        poll => poll.uuid == formValue.pollUuid
      )[0];
      this.selectQuestions = formValue.selectQuestions;

      const pollUUID = formValue.pollUuid;
      const dataPoll = this.heatMapService.getDataPoll(pollUUID);

      dataPoll.subscribe(data => {
        this.mockupAnswers = adaptAnswers(data.body);
        this.selectSurveyKinds = this.myForm.get('selectSurveyKinds')?.value;
        this.questions = this.selectSurveyKinds.reduce(
          (sks, sk) => sks.concat(this.mockupAnswers[sk]!.questions.questions),
          [] as Question[]
        );
        this.updateChart();
      });
    });
  }

  loadPollsList(): void {
    this.pollService.getDataPollList().subscribe(data => {
      this.pollsData = data;
      this.selectedPoll = data[0];
      this.myForm.get('pollUuid')?.setValue(data[0].uuid);
    });
  }

  initForm() {
    const form = new FormGroup({
      selectQuestions: new FormControl(
        [],
        [Validators.required, this.selectQuestionsValidator]
      ),
      selectSurveyKinds: new FormControl(
        this.defaultSurvey,
        Validators.required
      ),
      pollUuid: new FormControl(''),
    });

    return form;
  }

  updateChart() {
    if (this.myForm.valid) {
      this.chartOptions = {
        ...this.chartOptions,
        series: filterAnswers(
          this.getSeriesFromComponents(
            this.mockupAnswers,
            this.selectSurveyKinds
          ),
          this.selectQuestions
        ),
        title: {
          text: this.selectSurveyKinds.join(' '),
        },
      };
    } else {
      console.log('Form is invalid. Please fill in all required fields.');
    }
  }

  selectQuestionsValidator(
    control: FormControl
  ): Record<string, boolean> | null {
    const value = control.value;

    if (value.length === 0) {
      return { invalidDomain: true };
    }

    return null;
  }

  onSubmit() {
    const pollUUID = this.myForm.get('pollUuid')?.value;
    const dataPoll = this.heatMapService.getDataPoll(pollUUID);

    dataPoll.subscribe(data => {
      this.mockupAnswers = adaptAnswers(data.body);
      this.selectSurveyKinds = this.myForm.get('selectSurveyKinds')?.value;
      this.questions = this.selectSurveyKinds.reduce(
        (sks, sk) => sks.concat(this.mockupAnswers[sk]!.questions.questions),
        [] as Question[]
      );
      this.updateChart();
    });

    this.selectSurveyKinds = this.myForm.get('selectSurveyKinds')?.value;

    this.questions = this.selectSurveyKinds.reduce(
      (sks, sk) => sks.concat(this.mockupAnswers[sk]!.questions.questions),
      [] as Question[]
    );
    this.selectQuestions = this.myForm.get('selectQuestions')?.value;
    this.updateChart();
  }

  getSeriesFromComponents(
    mockupAnswers: MockUpAnswers,
    selectSurveyKinds: SurveyKind[]
  ): ApexAxisChartSeries {
    let series: ApexAxisChartSeries = [];

    Object.entries(mockupAnswers).forEach(([k, v]) => {
      if (v !== null && selectSurveyKinds.includes(k as SurveyKind)) {
        series = series.concat(v.series);
      }
    });

    // Give same size to all rows
    if (selectSurveyKinds.length > 1) {
      series = orderAnswers(series, true);
    }

    return series;
  }
}
