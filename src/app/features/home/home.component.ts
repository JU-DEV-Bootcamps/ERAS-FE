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
import { EvaluationProcessService } from '../../core/services/evaluation-process.service';
import { PollModel } from '../../core/models/PollModel';
import { CohortsSummaryModel, CohortSummaryModel } from '../../core/models/CohortSummaryModel';
import { Observable } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIcon,
    BarChartComponent,
    PieChartComponent,
    RouterLink,
    AsyncPipe,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  cohortsSummary$!: Observable<CohortsSummaryModel>;
  evalProcSummary$!: Observable<PollModel[]>;
  router = inject(Router);
  cohortsService = inject(CohortService);
  evalService = inject(EvaluationProcessService);
  clService = inject(CosmicLatteService);
  healthCheckStatus = false;

  async ngOnInit(): Promise<void> {
    this.healthCheck();
    this.evalProcSummary$ = this.evalService.getEvalProcSummary();
    this.cohortsSummary$ = this.cohortsService.getCohortsSummary();
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
