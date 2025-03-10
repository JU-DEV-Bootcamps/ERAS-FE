/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PollModel } from '../models/PollModel';

@Injectable({
  providedIn: 'root',
})
export class EvaluationProcessService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/EvaluationProcess';

  constructor(private http: HttpClient) {}

  getEvalProcSummary(): Observable<PollModel[]> {
    return this.http.get<PollModel[]>(
      `${this.apiUrl}/${this.endpoint}/summary`
    );
  }
}
