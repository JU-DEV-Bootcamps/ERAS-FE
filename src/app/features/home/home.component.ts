import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import {
  CohortsSummaryModel,
  EvaluationModel,
} from '../../core/models/summary.model';
import { MatDialog } from '@angular/material/dialog';
import { StudentRisklevelTableComponent } from '../../shared/components/student-risklevel-table/student-risklevel-table.component';
import { PollModel } from '../../core/models/poll.model';
import { CohortService } from '../../core/services/api/cohort.service';
import { EvaluationsService } from '../../core/services/api/evaluations.service';
import { CosmicLatteService } from '../../core/services/api/cosmic-latte.service';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper/types';
import { DatePipe } from '@angular/common';
import {
  arrayToApexChartSeries,
  FormatOptions,
} from '../reports/util/data.adapter';
import { AnswerModel } from '../../core/models/answer.model';
import { PollInstanceModel } from '../../core/models/poll-instance.model';
import { EmptyDataComponent } from '../../shared/components/empty-data/empty-data.component';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { ReportService } from '../../core/services/api/report.service';
import { AnswersRisks, RiskLevel } from '../../core/models/common/risk.model';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

register();

interface SwiperEventTarget extends EventTarget {
  swiper: Swiper;
}
@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIcon,
    RouterLink,
    DatePipe,
    NgApexchartsModule,
    EmptyDataComponent,
    BarChartComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements OnInit {
  cohortsList: string[] = [];
  cohortsSummary: CohortsSummaryModel | undefined;
  summaryReqError: string | undefined;

  evalProcSummary: EvaluationModel[] | undefined;
  lastEvalProc: EvaluationModel | undefined;
  idxChosenEval = 0;
  mainEPPoll: PollModel | undefined;
  riskStudentCount = 0;
  riskPollAverage = 0;
  selectedPollUuid = '';
  riskLevels = {
    risks: [] as number[],
    levels: [] as RiskLevel[],
  };
  riskLevelAvg = '-';
  isLoadingEvaluations = true;
  isLoadingPollInstances = true;

  router = inject(Router);
  cohortsService = inject(CohortService);
  evalService = inject(EvaluationsService);
  clService = inject(CosmicLatteService);
  reportService = inject(ReportService);
  readonly dialog = inject(MatDialog);
  riskStudentsDetail: {
    studentId: string;
    studentName: string;
    riskLevel: number;
  }[] = [];

  healthCheckStatus = false;

  chartOptions: ApexOptions = {};

  async ngOnInit(): Promise<void> {
    this.healthCheck();
    this.loadEvalProcSummary();
    this.loadCohortsSummary();
    this.loadAvgPoll();
  }

  loadCohortsSummary() {
    this.cohortsService.getCohortsSummary().subscribe({
      next: summary => {
        this.cohortsSummary = summary;
        this.cohortsList = summary.summary.map(cohort => cohort.cohortName);
        this.riskStudentsDetail = summary.summary
          .sort((a, b) => b.pollinstancesAverage - a.pollinstancesAverage)
          .map(csummary => {
            return {
              studentId: csummary.studentUuid,
              studentName: csummary.studentName,
              riskLevel: csummary.pollinstancesAverage,
            };
          });
        this.riskStudentCount = this.riskStudentsDetail.filter(
          s => s.riskLevel >= 3
        ).length;
        this.riskPollAverage =
          this.riskStudentsDetail.reduce(
            (acc, curr) => acc + curr.riskLevel,
            0
          ) / this.riskStudentsDetail.length;
      },
      error: error => {
        this.summaryReqError = error;
      },
    });
  }

  loadAvgPoll() {
    this.selectedPollUuid = this.getLastPollUuid();
    if (this.selectedPollUuid) {
      this.isLoadingPollInstances = true;
      this.reportService.getSummaryPollReport(this.selectedPollUuid).subscribe({
        next: res => {
          const body = res.body as AnswersRisks;

          this.riskLevelAvg = body.averageRisk.toFixed(2);
          this.riskLevels =
            this.reportService.getBMSeriesFromSummaryReport(body);
        },
        error: error => {
          console.error('Error while obtaining poll instances data', error);
        },
        complete: () => {
          this.isLoadingPollInstances = false;
        },
      });
    } else {
      console.warn('No pollUuid is undefined');
      this.isLoadingPollInstances = false;
    }
  }

  loadEvalProcSummary() {
    this.evalService.getEvalProcSummary().subscribe({
      next: summary => {
        this.evalProcSummary = summary.entities;
        this.lastEvalProc = summary.entities.find(
          ev => ev.pollInstances.length > 0
        );
        if (this.lastEvalProc) {
          this.mainEPPoll = this.lastEvalProc.polls[0];
        }
      },
      error: error => {
        this.summaryReqError = error;
      },
      complete: () => {
        this.isLoadingEvaluations = false;
      },
    });
  }

  healthCheck() {
    this.clService.healthCheck().subscribe(response => {
      this.healthCheckStatus =
        response.entries.cosmicLatteApi.status === 'Healthy';
    });
  }

  redirectToLastPoll() {
    this.router.navigate([`list-students-by-poll`]);
  }

  openStudentsByCohortDialog() {
    this.dialog.open(StudentRisklevelTableComponent, {
      width: 'clamp(520px, 50vw, 650px)',
      maxWidth: '90vw',
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: this.riskStudentsDetail,
    });
  }
  onSlideChange(event: Event) {
    if (event.target && (event.target as SwiperEventTarget).swiper) {
      const swiperInstance = (event.target as SwiperEventTarget)
        .swiper as Swiper;

      this.idxChosenEval = swiperInstance.snapIndex;
      this.loadAvgPoll();
    }
  }

  getLastPollUuid() {
    if (!this.evalProcSummary) {
      console.warn('Evaluation summary is not defined');

      return '';
    }

    const chosenEvalSummary = this.evalProcSummary[this.idxChosenEval];
    const mostRecentPoll = chosenEvalSummary.polls[0];

    return mostRecentPoll?.uuid;
  }

  getPollInstancesChart(evaluation: EvaluationModel) {
    const formatOptions: FormatOptions<
      EvaluationModel,
      PollInstanceModel,
      AnswerModel
    > = {
      xAxisKey: 'answerText',
      yAxisKey: 'riskLevel',
      rowsKey: 'pollInstances',
      colsKey: 'answers',
    };
    const evaluationSeries = arrayToApexChartSeries(evaluation, formatOptions);

    return {
      ...this.chartOptions,
      series: evaluationSeries,
      title: {
        text: `Risk Heatmap - ${evaluation.name} - ${evaluation.pollName}`,
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
      tooltip: {
        x: {
          show: true,
        },
        y: {
          formatter: function (val: number, opts?: unknown): string {
            if (opts) {
              const options = opts as {
                seriesIndex: number;
                dataPointIndex: number;
                series: number[][];
              };
              const rowIdx = options.seriesIndex;
              const colIdx = options.dataPointIndex;
              const grid = options.series;

              if (!grid || !rowIdx || !colIdx || grid[rowIdx][colIdx] === -1) {
                return '';
              }
            }
            return val.toString();
          },
          title: {
            formatter: function (): string {
              return 'Average Risk Level:';
            },
          },
        },
      },
    };
  }
}
