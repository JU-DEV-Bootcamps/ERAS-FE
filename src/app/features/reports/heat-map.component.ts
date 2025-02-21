import {
  Component,
  inject,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
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
  SurveyKind,
  MockUpAnswers,
  Question,
} from './types/data.generator';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ModalRiskStudentsVariablesComponent } from '../heat-map/modal-risk-students-variables/modal-risk-students-variables.component';
import { ModalRiskStudentsDetailComponent } from '../heat-map/modal-risk-students-detail/modal-risk-students-detail.component';
import { Components } from '../heat-map/types/risk-students-detail.type';
import {
  ComponentData,
  StudentData,
} from '../heat-map/types/risk-students-variables.type';

@Component({
  selector: 'app-charts',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatExpansionModule,
    MatSlideToggleModule,
  ],
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.scss'],
})
export class HeatMapComponent {
  readonly dialog = inject(MatDialog);
  private renderer: Renderer2;
  @ViewChild('chart') chartElement!: ElementRef;

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

  public questions: Question[] = [] as Question[];
  public selQuestions: string[] = [];
  public selSurveyKind = this.defaultSurvey;

  isChecked = false;

  public dataArray: ComponentData[] = [
    {
      componentName: 'ACADEMIC',
      variables: [
        {
          name: 'Question - 0',
          students: [
            {
              uuid: '1',
              answer: '4',
              name: 'Jorge',
              riskLevel: 40,
            },
            {
              uuid: '2',
              answer: '3',
              name: 'Maria',
              riskLevel: 30,
            },
          ],
        },
        {
          name: 'Question - 1',
          students: [
            {
              uuid: '3',
              answer: '2',
              name: 'Carlos',
              riskLevel: 20,
            },
            {
              uuid: '4',
              answer: '1',
              name: 'Ana',
              riskLevel: 50,
            },
          ],
        },
      ],
    },
  ];

  constructor(renderer: Renderer2) {
    this.renderer = renderer;

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

    this.questions =
      this.mockupAnswers[this.selSurveyKind]!.questions.questions;
    this.chartOptions = {
      series: filterAnswers(
        this.mockupAnswers[this.selSurveyKind]!.series,
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
        // events: {
        //   mounted: (chartContext, config) => {
        //     console.log(config.config.series);
        //     this.addCustomFunctionality();
        //   },
        // },
      },
      title: {
        text: this.selSurveyKind,
      },
      xaxis: {
        categories: [''],
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '16px',
          },
        },
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
    this.selQuestions = this.questions.map(q => q.description);

    const form = new FormGroup({
      selQuestions: new FormControl(this.selQuestions, [
        Validators.required,
        this.selQuestionsValidator,
      ]),
      selSurveyKind: new FormControl(this.defaultSurvey, Validators.required),
    });

    return form;
  }

  updateChart() {
    if (this.myForm.valid) {
      this.chartOptions = {
        ...this.chartOptions,
        series: filterAnswers(
          this.mockupAnswers[this.selSurveyKind]!.series,
          this.selQuestions
        ),
        title: {
          text: this.selSurveyKind,
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
    this.selSurveyKind = this.myForm.get('selSurveyKind')?.value;
    this.updateChart();
  }

  openStudentsDetailsDialog() {
    const component: Record<SurveyKind, string> = {
      ACADEMIC: Components.ACADEMIC,
      SOCIAL: Components.SOCIO_ECONOMIC,
      INDIVIDUAL: Components.INDIVIDUAL,
      FAMILIAR: Components.FAMILIAR,
    };
    const dialogRef = this.dialog.open(ModalRiskStudentsDetailComponent, {
      data: {
        component: component[this.selSurveyKind],
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  //Show studenta data by variable

  openDialog(data: StudentData[]) {
    this.dialog.open(ModalRiskStudentsVariablesComponent, {
      data: data,
    });
  }

  showStudentaData() {
    return;
  }

  findQuestionData(componentName: string, questionName: string) {
    const component = this.dataArray.find(
      comp => comp.componentName === componentName
    );
    if (component) {
      return component.variables.find(question => {
        return question.name === questionName;
      });
    }
    return null;
  }
}
