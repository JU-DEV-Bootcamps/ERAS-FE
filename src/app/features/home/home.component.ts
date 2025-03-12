import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from '../../shared/components/charts/pie-chart/pie-chart.component';
import { Router, RouterLink } from '@angular/router';
import { CohortService } from '../../core/services/cohort.service';
import { CosmicLatteService } from '../../core/services/cosmic-latte.service';
import { EvaluationProcessService } from '../../core/services/evaluation-process.service';
import { PollModel } from '../../core/models/PollModel';
import { CohortsSummaryModel } from '../../core/models/CohortSummaryModel';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIcon,
    BarChartComponent,
    PieChartComponent,
    RouterLink,
    DatePipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  // Cohorts-Students-PollIntances-Answer-Variable Data
  cohortsList: string[] = [];
  cohortsSummary: CohortsSummaryModel | undefined;
  summaryReqError: string | undefined;
  // EvalProcess-Polls-PollIntances-Answer-Variable Data
  evalProcSummary: PollModel[] | undefined;
  router = inject(Router);
  cohortsService = inject(CohortService);
  evalService = inject(EvaluationProcessService);
  clService = inject(CosmicLatteService);
  healthCheckStatus = false;
  pollResults = [44, 55, 13, 43, 22, 113];
  async ngOnInit(): Promise<void> {
    this.healthCheck();
    this.loadEvalProcSummary();
    this.loadCohortsSummary();
  }

  loadCohortsSummary() {
    this.cohortsService.getCohortsSummary().subscribe({
      next: summary => {
        console.info(summary);
        this.cohortsSummary = summary;
        this.cohortsList = summary.summary.map(cohort => cohort.cohortName);
      },
      error: error => {
        this.summaryReqError = error;
      },
    });
  }

  loadEvalProcSummary() {
    this.evalService.getEvalProcSummary().subscribe({
      next: summary => {
        console.info(summary);
        this.evalProcSummary = summary;
      },
      error: error => {
        this.summaryReqError = error;
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
    this.router.navigate([`list-polls-by-cohort`]);
  }
}
