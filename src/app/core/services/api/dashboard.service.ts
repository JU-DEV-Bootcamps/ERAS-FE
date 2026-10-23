import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { DashboardKpiResponse } from '@core/models/dashboard-kpis.model';
import { of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseApiService {
  protected resource = 'dashboard';

  private cachedKpi: DashboardKpiResponse | null = null;
  private lastFetchedAt: Date | null = null;

  getDashboardKPI() {
    if (this.cachedKpi) {
      return of(this.cachedKpi);
    }
    return this.get<DashboardKpiResponse>('kpis').pipe(
      tap(response => {
        this.cachedKpi = response;
        this.lastFetchedAt = new Date();
      })
    );
  }

  getLastFetchedAt(): Date | null {
    return this.lastFetchedAt;
  }

  invalidateCache(): void {
    this.cachedKpi = null;
    this.lastFetchedAt = null;
  }
}
