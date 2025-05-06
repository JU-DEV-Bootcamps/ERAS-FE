import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { Router, RouterLink } from '@angular/router';
import { EvaluationsService } from '../../core/services/api/evaluations.service';
import {
  CohortsSummaryModel,
  EvaluationModel,
} from '../../core/models/summary.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { StudentRisklevelTableComponent } from '../../shared/components/student-risklevel-table/student-risklevel-table.component';
import { MatTooltip } from '@angular/material/tooltip';
import { PollModel } from '../../core/models/poll.model';
import { CohortService } from '../../core/services/api/cohort.service';
import { CosmicLatteService } from '../../core/services/api/cosmic-latte.service';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIcon,
    BarChartComponent,
    //PieChartComponent,
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatTooltip,
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
  evalProcSummary: EvaluationModel[] | undefined;
  lastEvalProc: EvaluationModel | undefined;
  mainEPPoll: PollModel | undefined;
  riskStudentCount = 0;
  riskPollAverage = 0;
  //Services
  router = inject(Router);
  cohortsService = inject(CohortService);
  evalService = inject(EvaluationsService);
  clService = inject(CosmicLatteService);
  readonly dialog = inject(MatDialog);
  riskStudentsDetail: {
    studentId: string;
    studentName: string;
    riskLevel: number;
  }[] = [];

  healthCheckStatus = false;
  pollResults = [6, 5, 1, 4, 2, 6];
  async ngOnInit(): Promise<void> {
    this.healthCheck();
    this.loadEvalProcSummary();
    this.loadCohortsSummary();
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

  loadEvalProcSummary() {
    this.evalService.getEvalProcSummary().subscribe({
      next: summary => {
        this.evalProcSummary = summary.entities;
        this.lastEvalProc = summary.entities.find(
          ev => ev.pollInstances.length > 0
        );
        this.mainEPPoll = this.lastEvalProc?.polls[0];
        console.warn(this.lastEvalProc);
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
}
