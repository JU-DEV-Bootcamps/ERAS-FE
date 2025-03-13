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
import { MatDialog } from '@angular/material/dialog';
import { StudentRisklevelTableComponent } from '../../shared/components/student-risklevel-table/student-risklevel-table.component';

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
  readonly dialog = inject(MatDialog);
  riskStudentsDetail: {
    studentId: string;
    studentName: string;
    riskLevel: number;
  }[] = [];

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
      },
      error: error => {
        this.summaryReqError = error;
      },
    });
  }

  loadEvalProcSummary() {
    this.evalService.getEvalProcSummary().subscribe({
      next: summary => {
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
    this.router.navigate([`list-students-by-poll`]);
  }

  openStudentsByCohortDialog() {
    this.dialog.open(StudentRisklevelTableComponent, {
      width: 'clamp(320px, 40vw, 550px)',
      maxWidth: '80vw',
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: this.riskStudentsDetail,
    });
  }
}
