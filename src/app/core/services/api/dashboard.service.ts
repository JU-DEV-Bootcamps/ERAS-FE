import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { DashboardKpiResponse } from '@core/models/dashboard-kpis.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseApiService {
  protected resource = 'dashboard';

  getDashboardKPI() {
    return this.get<DashboardKpiResponse>('kpis');
  }
}
