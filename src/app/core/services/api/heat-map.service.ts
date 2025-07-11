import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { PollData } from '../../../features/reports/types/data.adapter';
import {
  ComponentValueType,
  RiskStudentDetailType,
} from '../../../features/heat-map/types/risk-students-detail.type';
import { DEFAULT_LIMIT } from '../../constants/pagination';
import { GetQueryResponse } from '../../models/summary.model';
import { HeatmapSummaryModel } from '../../models/heatmap-summary.model';
import { map, Observable, of } from 'rxjs';
import { SummaryHeatMapData } from '../../models/heatmap-data.model';

@Injectable({
  providedIn: 'root',
})
export class HeatMapService extends BaseApiService {
  protected resource = 'heat-map';
  private pollQuestions = new Map<string, PollData[]>();

  getDataPoll(pollUUID: string) {
    const endpoint = 'polls';

    if (this.pollQuestions.has(pollUUID)) {
      const pollData = this.pollQuestions.get(pollUUID)!;
      return of(pollData);
    } else {
      return this.get<{ body: PollData[] }>(`${endpoint}/${pollUUID}`).pipe(
        map((response: { body: PollData[] }) => {
          this.pollQuestions.set(pollUUID, response.body);
          return response.body;
        })
      );
    }
  }

  getSummaryData(pollId: string) {
    return this.get<GetQueryResponse<HeatmapSummaryModel>>(
      `polls/${pollId}/summary`
    );
  }

  getStudentHeatMapDetails(
    component: ComponentValueType,
    limit?: number | null
  ) {
    const params = new HttpParams()
      .set('component', component)
      .set('limit', limit ?? DEFAULT_LIMIT);

    return this.get<RiskStudentDetailType[]>('details', params);
  }

  getSummaryDataByCohortAndDays(cohortId: string, days: string) {
    const params = new HttpParams().set('days', days);
    return this.get(`cohorts/${cohortId}/summary`, params);
  }

  getStudentHeatMapDetailsByCohort(cohortId: string, limit?: number | null) {
    const params = new HttpParams().set('limit', limit ?? DEFAULT_LIMIT);
    return this.get<RiskStudentDetailType[]>(`cohorts/${cohortId}/top`, params);
  }

  generateHeatmap(
    pollInstanceUuid: string,
    variablesIds: number[],
    cohortId?: number
  ): Observable<SummaryHeatMapData[]> {
    return this.post('', { pollInstanceUuid, cohortId, variablesIds });
  }
}
