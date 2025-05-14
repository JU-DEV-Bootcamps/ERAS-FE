import { Injectable } from '@angular/core';
import { CohortModel } from '../../models/cohort.model';
import { CohortsSummaryModel } from '../../models/summary.model';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CohortService extends BaseApiService {
  protected resource = 'cohorts';

  getCohorts() {
    return this.get<ApiResponse<CohortModel[]>>('');
  }

  getCohortsSummary() {
    return this.get<CohortsSummaryModel>('summary');
  }

  getCohortsDetails() {
    return this.get<CohortsSummaryModel>('details');
  }
}
