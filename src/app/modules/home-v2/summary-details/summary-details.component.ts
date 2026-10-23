import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { StatsCardV2Component } from '@shared/components/cards/stats-card-v2/stats-card-v2.component';
import { DashboardKpiResponse } from '@core/models/dashboard-kpis.model';
import { DashboardService } from '@core/services/api/dashboard.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-summary-details-v2',
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
export class SummaryDetailsV2Component implements OnInit {
  gridColumns = signal(3);
  kpi: DashboardKpiResponse | null = null;
  lastUpdated = output<Date>();

  private destroyRef = inject(DestroyRef);
  breakpointObserver = inject(BreakpointObserver);
  dashboardService = inject(DashboardService);

  ngOnInit() {
    this.dashboardService.getDashboardKPI().subscribe(response => {
      this.kpi = response;
      const fetchedAt = this.dashboardService.getLastFetchedAt();
      if (fetchedAt) this.lastUpdated.emit(fetchedAt);
    });

    this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.gridColumns.set(result.matches ? 1 : 3);
      });
  }
}
