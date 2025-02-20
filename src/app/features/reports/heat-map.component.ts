import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { NgApexchartsModule } from 'ng-apexcharts';

import {
  generateMockupQuestions,
  generateMockupAnswers,
} from './services/data.generator';
import {
  adaptAnswers,
  filterAnswers,
  orderAnswers,
} from './services/data.adapter';

import { ApexOptions } from 'ng-apexcharts';
import {
  Conf,
  MockUpAnswers,
  ComponentName,
  Variable,
} from './types/data.generator';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

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
export class HeatMapComponent {
  public myForm!: FormGroup;
  public chartOptions!: ApexOptions;
  public componentKinds: ComponentName[] = [
    'ACADEMIC',
    'INDIVIDUAL',
    'FAMILIAR',
    'SOCIAL',
  ];
  public mapping: string[] = ['ACADEMIC', 'INDIVIDUAL', 'FAMILIAR', 'SOCIAL'];

  private defaultPoll = this.componentKinds[0];
  public componentKind = this.defaultPoll;
  public mockupAnswers: MockUpAnswers = {
    ACADEMIC: null,
    INDIVIDUAL: null,
    FAMILIAR: null,
    SOCIAL: null,
  };

  public variables: Variable[] = [] as Variable[];
  public selQuestions: string[] = [];
  public selPollKind = this.defaultPoll;

  constructor(private http: HttpClient) {
    this.myForm = this.initForm();
  }

  ngOnInit(): void {
    this.http
      .get(
        'https://localhost:44365/api/HeatMap/components/polls/{pollUUID}'
      )
      .subscribe((data: any) => {
        data.body.forEach((componentKind: any, index: number) => {
          const mappedSurveyKind = this.mapping[index];
          console.log('Mapped survey kind: ', componentKind);
          this.mockupAnswers[mappedSurveyKind as keyof MockUpAnswers] = {
            variables: componentKind.variables,
            series: componentKind.series,
          };
        });
        this.selPollKind = this.mapping[0] as ComponentName;
        console.log('Selected component: ', this.selPollKind);

        this.variables =
          this.mockupAnswers[this.selPollKind]!.variables.variables;

        this.chartOptions = {
          series: filterAnswers(
            this.mockupAnswers[this.selPollKind]!.series,
            this.selQuestions
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
            text: this.selPollKind,
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
      });
  }

  initForm() {
    this.selQuestions = this.variables.map(q => q.description);

    const form = new FormGroup({
      selQuestions: new FormControl(this.selQuestions, [
        Validators.required,
        this.selQuestionsValidator,
      ]),
      selSurveyKind: new FormControl(this.defaultPoll, Validators.required),
    });

    return form;
  }

  updateChart() {
    if (this.myForm.valid) {
      console.log('Selected Option', this.selPollKind);
      this.chartOptions = {
        ...this.chartOptions,
        series: filterAnswers(
          this.mockupAnswers[this.selPollKind]!.series,
          this.selQuestions
        ),
        title: {
          text: this.selPollKind,
        },
      };
    } else {
      console.log('Form is invalid. Please fill in all required fields.');
    }
  }

  selQuestionsValidator(control: FormControl): Record<string, boolean> | null {
    const value = control.value;

    if (value.length === 0) {
      return { invalidDomain: true };
    }

    return null;
  }

  onSubmit() {
    this.selQuestions = this.myForm.get('selQuestions')?.value;
    this.selPollKind = this.myForm.get('selSurveyKind')?.value;
    this.updateChart();
  }
}
