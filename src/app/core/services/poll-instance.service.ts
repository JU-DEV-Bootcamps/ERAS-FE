/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PollInstanceService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/PollInstance';

  constructor(private http: HttpClient) {}

  getAllPollInstancesCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/count`);
  }

  getPollInstancesByLastDays(lastDays: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${this.endpoint}?lastDays=${lastDays}`
    );
  }

  getAllPollInstances(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}`);
  }
}
