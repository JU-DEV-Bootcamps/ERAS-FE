import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from '../../shared/components/charts/pie-chart/pie-chart.component';
import { Router, RouterLink } from '@angular/router';
import { CohortService } from '../../core/services/cohort.service';
import { CosmicLatteService } from '../../core/services/cosmic-latte.service';
import { HealthCheckResponse } from '../../shared/models/cosmic-latte/health-check.model';
import { EvaluationProcessService } from '../../core/services/evaluation-process.service';
import { CohortSummaryModel } from '../../core/models/CohortSummaryModel';
import { PollModel } from '../../core/models/PollModel';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIcon,
    BarChartComponent,
    PieChartComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  cohortsSummary: CohortSummaryModel[] = [];
  studentsCount: string | number = '?';
  cohortsCount: string | number = '?';
  pollsCount: string | number = '?';
  pollsInstanceCount: string | number = '?';
  evaluationsCount: string | number = '?';
  evalSummary: PollModel[] = [];
  lastPoll: PollModel | null = null;
  healthCheckRes: HealthCheckResponse | null = null;
  healthCheckStatus = false;

  router = inject(Router);
  cohortsService = inject(CohortService);
  evalService = inject(EvaluationProcessService);
  clService = inject(CosmicLatteService);

  ngOnInit(): void {
    this.loadEvalProcSummary();
    this.loadCohortsSummary();
    this.healthCheck();
  }

  loadEvalProcSummary(): void {
    this.evalService.getEvalProcSummary().subscribe(data => {
      this.pollsCount = data.length;
      this.pollsInstanceCount = 0;
      this.lastPoll = data[0];
      this.evalSummary = data;
    });
  }

  loadCohortsSummary(): void {
    this.cohortsService.getCohortsSummary().subscribe(data => {
      this.cohortsCount = new Set(data.map(d => d.cohortName)).size;
      this.studentsCount = data.length;
      this.cohortsSummary = data;
    });
  }

  healthCheck() {
    this.clService.healthCheck().subscribe(response => {
      this.healthCheckStatus =
        response.entries.cosmicLatteApi.status === 'Healthy';
      this.healthCheckRes = response;
    });
  }

  redirectToLastPoll() {
    this.router.navigate([`polls/${this.lastPoll?.id}`]);
  }
}
