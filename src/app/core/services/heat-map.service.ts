import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  ComponentValueType,
  RiskStudentDetailType,
} from '../../features/heat-map/types/risk-students-detail.type';
import { map, of } from 'rxjs';
import { DEFAULT_LIMIT } from '../constants/pagination';
import { PollData } from '../../features/reports/types/data.adapter';
import { HeatmapSummaryModel } from '../models/heatmap-summary.model';
import { HeatMapData } from '../models/heatmap-data.model';
import { BaseApiService } from './apiServices/base-api.service';
import { GetQueryResponse } from '../models/summary.model';

@Injectable({
  providedIn: 'root',
})
export class HeatMapService extends BaseApiService {
  protected apiUrl = `${environment.apiUrl}/api/v1/HeatMap`;
  private pollQuestions = new Map<string, PollData[]>();

  getStudentHeatMapDetails(
    component: ComponentValueType,
    limit?: number | null
  ) {
    const params = new HttpParams()
      .set('component', component)
      .set('limit', limit ?? DEFAULT_LIMIT);

    return this.get<RiskStudentDetailType[]>('heatmap-details', params);
  }

  getSummaryData(pollId: string) {
    return this.get<GetQueryResponse<HeatmapSummaryModel>>(
      `summary/polls/${pollId}`
    );
  }

  getSummaryDataByCohortAndDays(cohortId: string, days: string) {
    const params = new HttpParams().set('cohortId', cohortId).set('days', days);
    return this.get('summary/filter', params);
  }

  getStudentHeatMapDetailsByCohort(cohortId: string, limit?: number | null) {
    const params = new HttpParams().set('limit', limit ?? DEFAULT_LIMIT);
    return this.get<RiskStudentDetailType[]>(
      `cohort/${cohortId}/top-risk`,
      params
    );
  }
  generateHeatmap(pollInstanceUuid: string, variablesIds: number[]) {
    return this.post<
      { pollInstanceUuid: string; variablesIds: number[] },
      HeatMapData[]
    >('generate', { pollInstanceUuid, variablesIds });
  }

  getDataPoll(pollUUID: string) {
    const endpoint = 'components/polls';

    if (this.pollQuestions.has(pollUUID)) {
      const pollData = this.pollQuestions.get(pollUUID)!;

      return of(pollData);
    } else {
      return this.http
        .get<{ body: PollData[] }>(`${endpoint}/${pollUUID}`)
        .pipe(
          map((response: { body: PollData[] }) => {
            this.pollQuestions.set(pollUUID, response.body);
            return response.body;
          })
        );
    }
  }
}
