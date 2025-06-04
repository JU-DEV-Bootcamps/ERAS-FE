import { Injectable } from '@angular/core';
import { CohortModel } from '../../models/cohort.model';
import { CohortsSummaryModel } from '../../models/summary.model';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CohortService extends BaseApiService {
  protected resource = 'cohorts';

  getCohorts(pollUuid: string | null = null) {
    const params = new HttpParams().set('pollUuid', pollUuid || '');
    return this.get<ApiResponse<CohortModel[]>>('', params);
  }

  getCohortsByPollId(pollUuid: number | null = null) {
    const params = new HttpParams().set('pollId', pollUuid || '');
    return this.get<ApiResponse<CohortModel[]>>('poll', params);
  }

  getCohortsSummary() {
    return this.get<CohortsSummaryModel>('summary');
  }

  getCohortsDetails() {
    return this.get<CohortsSummaryModel>('details');
  }
}
