import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  ComponentValueType,
  RiskStudentDetailType,
} from '../../features/heat-map/types/risk-students-detail.type';
import { map, Observable, of } from 'rxjs';
import { DEFAULT_LIMIT } from '../constants/pagination';
import { PollData } from '../../features/reports/types/data.adapter';
import { HeatmapSummaryModel } from '../models/heatmap-summary.model';
import { ApiResponse } from '../models/api-response.model';
import { HeatMapData } from '../models/heatmap-data.model';

@Injectable({
  providedIn: 'root',
})
export class HeatMapService {
  private apiUrl = `${environment.apiUrl}/api/v1/HeatMap`;
  private pollQuestions = new Map<string, PollData[]>();

  constructor(private http: HttpClient) {}

  getStudentHeatMapDetails(
    component: ComponentValueType,
    limit?: number | null
  ) {
    const params = new HttpParams()
      .set('component', component)
      .set('limit', limit ?? DEFAULT_LIMIT);

    return this.http.get<RiskStudentDetailType[]>(
      `${this.apiUrl}/heatmap-details`,
      { params }
    );
  }

  getSummaryData(pollId: string): Observable<ApiResponse<HeatmapSummaryModel>> {
    return this.http.get<ApiResponse<HeatmapSummaryModel>>(
      `${this.apiUrl}/summary/polls/${pollId}`
    );
  }

  getSummaryDataByCohortAndDays(cohortId: string, days: string) {
    const params = new HttpParams().set('cohortId', cohortId).set('days', days);
    return this.http.get(`${this.apiUrl}/summary/filter`, { params });
  }

  getStudentHeatMapDetailsByCohort(cohortId: string, limit?: number | null) {
    const params = new HttpParams().set('limit', limit ?? DEFAULT_LIMIT);
    return this.http.get<RiskStudentDetailType[]>(
      `${this.apiUrl}/cohort/${cohortId}/top-risk`,
      { params }
    );
  }
  generateHeatmap(pollInstanceUuid: string, variablesIds: number[]) {
    return this.http.post<HeatMapData[]>(`${this.apiUrl}/generate`, {
      pollInstanceUuid,
      variablesIds,
    });
  }

  getDataPoll(pollUUID: string): Observable<PollData[]> {
    const endpoint = 'components/polls';

    if (this.pollQuestions.has(pollUUID)) {
      const pollData = this.pollQuestions.get(pollUUID)!;

      return of(pollData);
    } else {
      return this.http
        .get<{ body: PollData[] }>(`${this.apiUrl}/${endpoint}/${pollUUID}`)
        .pipe(
          map((response: { body: PollData[] }) => {
            this.pollQuestions.set(pollUUID, response.body);
            return response.body;
          })
        );
    }
  }
}
