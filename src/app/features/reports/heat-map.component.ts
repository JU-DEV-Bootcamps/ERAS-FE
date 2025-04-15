import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  adaptAnswers,
  filterAnswers,
  orderAnswers,
} from './services/data.adapter';

import { ApexOptions } from 'ng-apexcharts';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  SurveyKind,
  MockUpAnswers,
  Question,
  QuestionsSeries,
} from './types/data.generator';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ModalRiskStudentsVariablesComponent } from '../heat-map/modal-risk-students-variables/modal-risk-students-variables.component';
import { HeatMapService } from './services/heat-map.service';
import { PollService } from '../../core/services/poll.service';
import { Poll } from '../list-students-by-poll/types/list-students-by-poll';

import { ModalRiskStudentsDetailComponent } from '../heat-map/modal-risk-students-detail/modal-risk-students-detail.component';
import { DialogRiskVariableData } from '../heat-map/types/risk-students-variables.type';
import { RiskStudentsTableComponent } from '../../shared/components/risk-students-table/risk-students-table.component';
import { ModalRiskStudentsCohortComponent } from '../heat-map/modal-risk-students-cohort/modal-risk-students-cohort.component';
import { register } from 'swiper/element/bundle';
import { PdfService } from '../../core/services/report/pdf.service';
import { RISK_COLORS } from '../../core/constants/riskLevel';

register();
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
    MatFormFieldModule,
    RiskStudentsTableComponent,
  ],
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeatMapComponent implements OnInit {
  @ViewChild('mainContainer', { static: false }) mainContainer!: ElementRef;
  private readonly exportPrintService = inject(PdfService);
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
      type: 'category',
      labels: {
        show: false,
      },
      tooltip: {
        enabled: false,
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
              color: RISK_COLORS[0],
              name: 'No answer',
            },
            {
              from: 0,
              to: 2,
              color: RISK_COLORS[1],
              name: 'Low Risk',
            },
            {
              from: 2,
              to: 4,
              color: RISK_COLORS[2],
              name: 'Low-Medium Risk',
            },
            {
              from: 4,
              to: 6,
              color: RISK_COLORS[3],
              name: 'Medium Risk',
            },
            {
              from: 6,
              to: 8,
              color: RISK_COLORS[4],
              name: 'Medium-High Risk',
            },
            {
              from: 8,
              to: 100,
              color: RISK_COLORS['default'],
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
      x: {
        show: true,
        formatter: function (val, opts) {
          const seriesIndex = opts.seriesIndex;
          const dataPointIndex = opts.dataPointIndex;
          const xValue =
            opts.w.config.series[seriesIndex].data[dataPointIndex].x;

          return `Answer: ${xValue}`;
        },
      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const yValue = series[seriesIndex][dataPointIndex];
        const xValue = w.config.series[seriesIndex].data[dataPointIndex].x;
        const seriesName = w.config.series[seriesIndex].name;

        return `<div class="apexcharts-tooltip-y" style="font-size: 13px; margin: 4px"><b>(${yValue})</b> ${seriesName}</div>
                <div style="border-top: 1px solid #ccc;"></div>
                <div class="apexcharts-tooltip-x" style="font-size: 13px; margin: 4px"><b>Answer:</b> ${xValue}</div>`;
      },
    },
  };
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
  public variableIds: number[] = [];
  private heatMapService = inject(HeatMapService);
  private pollService = inject(PollService);
  public isGeneratingPDF = false;

  pollsData: Poll[] = [];
  selectedPoll = this.pollsData[0];

  public modalDataSudentVariable: DialogRiskVariableData =
    {} as DialogRiskVariableData;

  readonly dialog = inject(MatDialog);

  constructor(private snackBar: MatSnackBar) {
    this.myForm = this.initForm();
  }

  ngOnInit(): void {
    this.loadPollsList();
    setTimeout(() => {
      this.myForm
        .get('selectQuestions')
        ?.setValue(this.questions.map(q => q.description));
    }, 750);
    this.myForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(formValue => {
        this.selectedPoll = this.pollsData.filter(
          poll => poll.uuid == formValue.pollUuid
        )[0];
        this.selectQuestions = formValue.selectQuestions;

        const pollUUID = formValue.pollUuid;
        const dataPoll = this.heatMapService.getDataPoll(pollUUID);

        dataPoll.subscribe(data => {
          this.modalDataSudentVariable = {
            pollUUID: pollUUID,
            pollName: this.selectedPoll.name,
            data: data.body,
          };
          this.mockupAnswers = adaptAnswers(data.body);
          this.selectSurveyKinds = this.myForm.get('selectSurveyKinds')?.value;
          this.questions = this.selectSurveyKinds.reduce(
            (sks, sk) =>
              sks.concat(this.mockupAnswers[sk]!.questions.questions),
            [] as Question[]
          );
          this.variableIds = this.questions.map(q => q.variableId);
          this.updateChart();
        });
      });
  }

  loadPollsList(): void {
    this.pollService.getAllPolls().subscribe(data => {
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
  openStudentsDetailsDialog() {
    this.dialog.open(ModalRiskStudentsDetailComponent, {
      width: 'clamp(320px, 40vw, 550px)',
      maxWidth: '80vw',
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
    });
  }

  //Show studenta data by variable

  openDialog() {
    this.dialog.open(ModalRiskStudentsVariablesComponent, {
      width: 'auto',
      maxWidth: '80vw',
      minHeight: '500px',
      maxHeight: '80vh',
      panelClass: 'border-modalbox-dialog',
      data: this.modalDataSudentVariable,
    });
  }

  openStudentsByCohortDialog() {
    this.dialog.open(ModalRiskStudentsCohortComponent, {
      width: 'clamp(320px, 40vw, 550px)',
      maxWidth: '80vw',
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
    });
  }

  printReportInfo() {
    if (this.isGeneratingPDF) return;
    this.isGeneratingPDF = true;
    const snackBarRef = this.snackBar.open('Generating PDF...', 'Close', {
      duration: 10000,
      panelClass: ['custom-snackbar'],
    });

    setTimeout(() => {
      const mainContainerElement = this.mainContainer.nativeElement;
      const clonedElement = mainContainerElement.cloneNode(true) as HTMLElement;
      clonedElement.style.width = '1440px';
      clonedElement.style.margin = 'auto';

      const swiperContainer = clonedElement.querySelector('#swiper-container');
      if (swiperContainer) {
        swiperContainer.removeAttribute('effect');
      }

      clonedElement.style.fontSize = '1.2em';

      const h2Elements = clonedElement.querySelectorAll('h2');
      h2Elements.forEach(h2 => (h2.style.fontSize = '1.6em'));

      const h3Elements = clonedElement.querySelectorAll('h3');
      h3Elements.forEach(h3 => (h3.style.fontSize = '1.4em'));

      const h4Elements = clonedElement.querySelectorAll('h4');
      h4Elements.forEach(h4 => (h4.style.fontSize = '1.2em'));

      const pElements = clonedElement.querySelectorAll('p');
      pElements.forEach(p => (p.style.fontSize = '1.2em'));

      clonedElement.querySelector('#print-button')?.remove();
      clonedElement.querySelector('.form-container')?.remove();
      clonedElement.querySelector('.filter-container')?.remove();
      clonedElement.querySelector('.title-card')?.remove();

      const containerCardList = clonedElement.querySelector(
        '.container-card-list'
      ) as HTMLElement;
      if (containerCardList) {
        Object.assign(containerCardList.style, {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        });
      }

      const chartContainer = clonedElement.querySelector(
        '.chart-container'
      ) as HTMLElement;
      if (chartContainer) {
        Object.assign(chartContainer.style, {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          margin: '0 auto',
          maxWidth: 'none',
        });
      }

      document.body.appendChild(clonedElement);

      this.exportPrintService.exportToPDF(clonedElement, `report-detail.pdf`);

      setTimeout(() => {
        snackBarRef.dismiss();

        this.snackBar.open('PDF generated successfully', 'OK', {
          duration: 3000,
          panelClass: ['custom-snackbar'],
        });
        this.isGeneratingPDF = false;
        document.body.removeChild(clonedElement);
      }, 2000);
    }, 10000);
  }
}
