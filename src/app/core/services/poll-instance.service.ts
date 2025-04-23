import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PollInstanceResponse } from './Types/pollInstance';
import { ServerResponse } from './Types/server.type';

@Injectable({
  providedIn: 'root',
})
export class PollInstanceService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/PollInstance';

  constructor(private http: HttpClient) {}

  getPollInstancesByLastDays(lastDays: number): Observable<ServerResponse> {
    return this.http.get(
      `${this.apiUrl}/${this.endpoint}?lastDays=${lastDays}`
    ) as Observable<ServerResponse>;
  }

  getPollInstancesByFilters(
    cohortId: number,
    lastDays: number
  ): Observable<PollInstanceResponse> {
    return this.http.get<PollInstanceResponse>(
      `${this.apiUrl}/${this.endpoint}/filter?cohortId=${cohortId}&days=${lastDays}`
    );
  }

  getAllPollInstances(): Observable<ServerResponse> {
    return this.http.get(
      `${this.apiUrl}/${this.endpoint}`
    ) as Observable<ServerResponse>;
  }
}
