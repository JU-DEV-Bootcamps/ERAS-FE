/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cohort } from '../../shared/models/cohort/cohort.model';

@Injectable({
  providedIn: 'root',
})
export class CohortService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Cohorts';

  constructor(private http: HttpClient) {}

  getCohorts(): Observable<Cohort[]> {
    return this.http.get<Cohort[]>(`${this.apiUrl}/${this.endpoint}`);
  }
  getCohortsSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/summary`);
  }
}
