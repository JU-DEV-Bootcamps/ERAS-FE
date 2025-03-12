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

const studentsPlaceholder = {
  count: 23,
};
const pollsPLaceholder = {
  count: 3,
};
const lastPollPlaceholder = {
  id: 1,
  title: 'Encuesta de Caracterizacion',
  version: '#latest',
  progress: '23/32',
  publishedDate: '10/10/2024',
  deadlineDate: '01/03/2025',
  average: 3.8,
  riskStudents: 3,
};

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
  students = studentsPlaceholder;
  studentsCount: string | number = '?';
  cohortsCount: string | number = '?';
  pollsCount: string | number = '?';
  pollsInstanceCount: string | number = '?';
  evaluationsCount: string | number = '?';
  polls = pollsPLaceholder;
  lastPoll = lastPollPlaceholder;
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
      this.pollsCount = data.polls.count;
      this.pollsInstanceCount = data.pollInstances.count;
    });
  }

  loadCohortsSummary(): void {
    this.cohortsService.getCohortsSummary().subscribe(data => {
      this.cohortsCount = data.cohorts.count;
      this.studentsCount = data.students.count;
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
    this.router.navigate([`polls/${this.lastPoll.id}`]);
  }
}
