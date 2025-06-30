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

  getCohorts(pollUuid: string | null = null) {
    const params = new HttpParams().set('pollUuid', pollUuid || '');
    return this.get<ApiResponse<CohortModel[]>>('', params);
  }

  getCohortsSummary(pagination: Pagination) {
    const params = new HttpParams()
      .set('PageSize', pagination.pageSize)
      .set('Page', pagination.page);

    return this.get<CohortsSummaryModel>('summary', params);
  }

  getCohortsDetails() {
    return this.get<CohortsSummaryModel>('details');
  }
}
