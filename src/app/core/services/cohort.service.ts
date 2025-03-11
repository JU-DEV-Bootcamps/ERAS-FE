/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CohortsSummaryModel } from '../models/CohortSummaryModel';

@Injectable({
  providedIn: 'root',
})
export class CohortService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Cohorts';

  constructor(private http: HttpClient) {}

  getCohorts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}`);
  }
  getCohortsSummary(): Observable<CohortsSummaryModel> {
    return this.http.get<CohortsSummaryModel>(
      `${this.apiUrl}/${this.endpoint}/summary`
    );
  }
}
