import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  ComponentValueType,
  RiskStudentDetailType,
} from '../../features/heat-map/types/risk-students-detail.type';
import { map, Observable, of } from 'rxjs';
import { DEFAULT_LIMIT } from '../constants/pagination';

@Injectable({
  providedIn: 'root',
})
export class HeatMapService {
  private apiUrl = `${environment.apiUrl}/api/v1/HeatMap`;
  private cache = new Map<string, unknown>();

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

  getSummaryData(pollId: string): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/summary/polls/${pollId}`);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDataPoll(pollUUID: string): Observable<any> {
    const endpoint = 'components/polls';

    if (this.cache.has(pollUUID)) {
      return of(this.cache.get(pollUUID));
    } else {
      return this.http.get(`${this.apiUrl}/${endpoint}/${pollUUID}`).pipe(
        map(response => {
          this.cache.set(pollUUID, response);
          return response;
        })
      );
    }
  }
}
