import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { HttpParams } from '@angular/common/http';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';
import { PagedResult } from '../interfaces/page.type';
import { Pagination } from '../interfaces/server.type';
import { RecentAlertsResponse } from '@core/models/recent-alerts-response.model';

@Injectable({
  providedIn: 'root',
})
export class EvaluationDetailsService extends BaseApiService {
  protected resource = 'evaluations';

  getStudentsByFilters(
    pollUuid: string,
    componentNames: string[],
    cohortIds: number[],
    variableIds: number[],
    pageSize: number,
    page: number,
    riskLevels?: number[],
    evaluationId?: number | string
  ) {
    let params = new HttpParams()
      .set('PollUuid', pollUuid)
      .set('PageSize', pageSize.toString())
      .set('Page', page.toString());

    const appendArray = (name: string, items: (string | number)[]) => {
      if (items && items.length > 0) {
        items.forEach(item => {
          params = params.append(name, item.toString());
        });
      }
    };

    appendArray('ComponentNames', componentNames);
    appendArray('CohortIds', cohortIds);

    if (variableIds && variableIds.length > 0) {
      appendArray('VariableIds', variableIds);
    }

    if (riskLevels && riskLevels.length > 0) {
      appendArray('RiskLevels', riskLevels);
    }

    if (evaluationId !== undefined && evaluationId !== null) {
      params = params.set('evaluationId', evaluationId.toString());
    }

    return this.get<PagedResult<EvaluationDetailsStudentResponse>>(
      `StudentsByFilters`,
      params
    );
  }

  getRecentAlerts(pagination: Pagination) {
    const params = new HttpParams()
      .set('PageSize', pagination.pageSize)
      .set('Page', pagination.page);

    return this.get<PagedResult<RecentAlertsResponse>>('alerts', params);
  }
}
