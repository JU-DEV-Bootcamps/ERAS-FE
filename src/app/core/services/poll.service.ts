/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Polls';

  constructor(private http: HttpClient) {}

  getDataPollList(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}`);
  }

  getPollsByCohortId(cohortId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/cohort/${cohortId}`);
  }

  getPollCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/count`);
  }

  getLastPoll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/last`);
  }
}
