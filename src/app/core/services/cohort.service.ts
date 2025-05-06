import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CohortStudentsRiskByPollResponse } from '../models/cohort.model';
import { CohortsSummaryModel } from '../models/summary.model';
import { CohortModel } from '../models/cohort.model';
import { CohortComponents } from '../models/cohort-components.model';

@Injectable({
  providedIn: 'root',
})
export class CohortService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Cohorts';

  constructor(private http: HttpClient) {}

  getCohorts(): Observable<CohortModel[]> {
    return this.http.get<CohortModel[]>(`${this.apiUrl}/${this.endpoint}`);
  }

  getCohortsSummary(): Observable<CohortsSummaryModel> {
    return this.http.get<CohortsSummaryModel>(
      `${this.apiUrl}/${this.endpoint}/summary`
    );
  }

  getCohortComponents(pollUuid: string): Observable<CohortComponents[]> {
    const params = new HttpParams().set('PollUuid', pollUuid);
    const url = `${this.apiUrl}/${this.endpoint}/componentsAvg`;
    return this.http.get<CohortComponents[]>(url, { params });
  }

  getCohortStudentsRiskByPoll(
    pollUuid: string,
    componentName: string,
    cohortId: number
  ): Observable<CohortStudentsRiskByPollResponse[]> {
    const params = new HttpParams()
      .set('PollUuid', pollUuid)
      .set('ComponentName', componentName)
      .set('CohortId', cohortId);
    const url = `${this.apiUrl}/${this.endpoint}/studentsRiskByComponent`;
    return this.http.get<CohortStudentsRiskByPollResponse[]>(url, { params });
  }

  getCohortStudentsRisk(
    pollUuid: string,
    cohortId: number
  ): Observable<CohortStudentsRiskByPollResponse[]> {
    const params = new HttpParams()
      .set('PollUuid', pollUuid)
      .set('CohortId', cohortId);
    const url = `${this.apiUrl}/${this.endpoint}/studentsRiskList`;
    return this.http.get<CohortStudentsRiskByPollResponse[]>(url, { params });
  }
}
