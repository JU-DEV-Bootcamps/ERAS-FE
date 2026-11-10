import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  output,
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

import { StatsCardV2Component } from '@shared/components/cards/stats-card-v2/stats-card-v2.component';
import { DashboardKpiResponse } from '@core/models/dashboard-kpis.model';
import { DashboardService } from '@core/services/api/dashboard.service';
import { ViewportService } from '@core/services/layout/viewport.service';

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
  kpi: DashboardKpiResponse | null = null;
  lastUpdated = output<Date>();

  readonly viewport = inject(ViewportService);
  dashboardService = inject(DashboardService);

  ngOnInit() {
    this.dashboardService.getDashboardKPI().subscribe(response => {
      this.kpi = response;
      const fetchedAt = this.dashboardService.getLastFetchedAt();
      if (fetchedAt) this.lastUpdated.emit(fetchedAt);
    });
  }
}
