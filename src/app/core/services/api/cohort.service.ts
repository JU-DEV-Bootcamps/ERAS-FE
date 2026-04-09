import { Injectable } from '@angular/core';
import { CohortModel } from '../../models/cohort.model';
import { CohortsSummaryModel } from '../../models/summary.model';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';
import { HttpParams } from '@angular/common/http';
import { Pagination } from '../interfaces/server.type';

@Injectable({
  providedIn: 'root',
})
export class CohortService extends BaseApiService {
  protected resource = 'cohorts';

  getCohorts(pollUuid: string | null = null, lastVersion = true) {
    const params = new HttpParams()
      .set('pollUuid', pollUuid || '')
      .set('lastVersion', lastVersion);

    return this.get<ApiResponse<CohortModel[]>>('', params);
  }

  getCohortsSummary(pagination: Pagination, evaluationId?: number) {
    let params = new HttpParams()
      .set('PageSize', pagination.pageSize)
      .set('Page', pagination.page);

    if (evaluationId != null) {
      params = params.set('EvaluationId', evaluationId);
    }

    return this.get<CohortsSummaryModel>('summary', params);
  }

  getCohortsDetails() {
    return this.get<CohortsSummaryModel>('details');
  }
}
