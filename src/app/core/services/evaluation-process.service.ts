/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvaluationProcessService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/EvaluationProcess';

  constructor(private http: HttpClient) {}

  getEvalProcSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}`);
  }
}
