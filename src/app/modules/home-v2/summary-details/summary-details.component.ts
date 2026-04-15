import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';

import { StatsCardV2Component } from '@shared/components/cards/stats-card-v2/stats-card-v2.component';
import { DashboardKpiResponse } from '@core/models/dashboard-kpis.model';
import { DashboardService } from '@core/services/api/dashboard.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-summary-details',
  imports: [
    MatIconModule,
    MatCardModule,
    MatGridListModule,
    StatsCardV2Component,
  ],
  templateUrl: './summary-details.component.html',
  styleUrl: './summary-details.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SummaryDetailsComponent implements OnInit {
  gridColumns = signal(3);
  kpis$: Observable<DashboardKpiResponse> | undefined;
  kpi: DashboardKpiResponse | null = null;

  private destroyRef = inject(DestroyRef);
  breakpointObserver = inject(BreakpointObserver);
  dashboardService = inject(DashboardService);

  ngOnInit() {
    this.dashboardService.getDashboardKPI().subscribe(response => {
      console.log('RESPONSE:', response);
      this.kpi = response;
    });

    this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.gridColumns.set(result.matches ? 1 : 3);
      });
  }
}
