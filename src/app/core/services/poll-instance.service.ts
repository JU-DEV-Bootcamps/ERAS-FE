import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { PollInstanceModel } from '../models/poll-instance.model';
import { ServerResponse } from './interfaces/server.type';

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
  ): Observable<ApiResponse<PollInstanceModel[]>> {
    return this.http.get<ApiResponse<PollInstanceModel[]>>(
      `${this.apiUrl}/${this.endpoint}/filter?cohortId=${cohortId}&days=${lastDays}`
    );
  }

  getAllPollInstances(): Observable<ServerResponse> {
    return this.http.get(
      `${this.apiUrl}/${this.endpoint}`
    ) as Observable<ServerResponse>;
  }
}
