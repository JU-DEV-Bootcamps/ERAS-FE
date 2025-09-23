import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  linkedSignal,
  OnInit,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { finalize } from 'rxjs';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper/types';

import { EvaluationsService } from '@core/services/api/evaluations.service';
import { ReportService } from '@core/services/api/report.service';

import { CountSummaryModel } from '@core/models/summary.model';
import { EvaluationModel } from '@core/models/evaluation.model';
import { PollModel } from '@core/models/poll.model';

import {
  Alpha3CountryNamePipe,
  Alpha3FlagPipe,
} from '../../shared/pipes/flag.pipe';
import {
  getEvalClass,
  getStatusForEvaluationProcess,
} from '@modules/lists/utils/evaluations.util';

import { EmptyDataComponent } from '../../shared/components/empty-data/empty-data.component';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { SummaryDetailsComponent } from './summary-details/summary-details.component';

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
    DatePipe,
    NgApexchartsModule,
    EmptyDataComponent,
    BarChartComponent,
    MatProgressSpinnerModule,
    Alpha3CountryNamePipe,
    Alpha3FlagPipe,
    NgClass,
    SummaryDetailsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements OnInit {
  EvaluationsError: string | undefined;
  PollInstanceError: string | undefined;
  count: CountSummaryModel | undefined;
  evaluations: EvaluationModel[] | undefined;
  selEval: EvaluationModel | undefined;
  selPoll: PollModel | undefined;
  idxChosenEval = 0;
  riskLevels = {
    risks: [] as number[],
    levels: [] as string[],
    colors: [] as string[],
  };
  riskLevelAvg = '-';
  isLoadingEvaluations = true;
  isLoadingPollInstances = true;

  router = inject(Router);
  evalService = inject(EvaluationsService);
  reportService = inject(ReportService);

  chartOptions: ApexOptions = {};

  query = linkedSignal(() => this.count);

  async ngOnInit(): Promise<void> {
    this.loadCount();
    this.loadEvaluations();
  }

  loadCount() {
    this.reportService
      .getCountSummary()
      .subscribe(response => (this.count = response.body));
  }

  loadEvaluations() {
    this.evalService
      .getAllEvalProc({ page: 0, pageSize: 10 })
      .pipe(finalize(() => (this.isLoadingEvaluations = false)))
      .subscribe({
        next: evals => {
          this.evaluations = evals.items;
          if (this.evaluations.length > 0)
            this.loadEvalDetails(this.evaluations[0].id);
        },
        error: error => (this.EvaluationsError = error),
      });
  }

  loadEvalDetails(evalId: number) {
    this.evalService.getEvalProcDetails(evalId).subscribe(response => {
      this.selEval = response.body;
      if (this.selEval?.polls && this.selEval?.polls.length > 0) {
        this.selPoll = this.selEval.polls[0];
        this.loadPollDetails(this.selPoll.uuid);
      } else {
        this.selPoll = undefined;
      }
    });
  }

  loadPollDetails(pollUuid: string) {
    this.reportService
      .getRiskCountPollReport(pollUuid)
      .pipe(
        finalize(() => {
          this.isLoadingPollInstances = false;
        })
      )
      .subscribe({
        next: response => {
          const body = response.body;
          this.riskLevelAvg = body.averageRisk.toFixed(2);
          this.riskLevels =
            this.reportService.getBMSeriesFromSummaryReport(body);
        },
        error: () =>
          (this.PollInstanceError = `Something went wrong when looking for poll ${pollUuid} details.`),
      });
  }

  onSlideChange(event: Event) {
    if (event.target && (event.target as SwiperEventTarget).swiper) {
      const swiperInstance = (event.target as SwiperEventTarget)
        .swiper as Swiper;
      this.idxChosenEval = swiperInstance.snapIndex;
      this.loadEvalDetails(this.evaluations![this.idxChosenEval].id);
    }
  }

  getEvalClass = (ev: EvaluationModel) => getEvalClass(ev);
  getEvalStatus = (ev: EvaluationModel) => getStatusForEvaluationProcess(ev);
}
