import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluationSummaryModel } from '../models/SummaryModel';
import {
  CreateEvaluationProcess,
  PagedReadEvaluationProcess,
  ReadEvaluationProcess,
} from '../../shared/models/EvaluationProcess';

@Injectable({
  providedIn: 'root',
})
export class EvaluationProcessService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Evaluation';

  constructor(private http: HttpClient) {}

  getEvalProcSummary(): Observable<EvaluationSummaryModel> {
    return this.http.get<EvaluationSummaryModel>(
      `${this.apiUrl}/${this.endpoint}/summary`
    );
  }
  createEvalProc(data: CreateEvaluationProcess): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/${this.endpoint}`, data);
  }
  getAllEvalProc({
    page = 1,
    pageSize = 10,
  }): Observable<PagedReadEvaluationProcess> {
    const params = new HttpParams().set('PageSize', pageSize).set('Page', page);
    return this.http.get<PagedReadEvaluationProcess>(
      `${this.apiUrl}/${this.endpoint}`,
      { params }
    );
  }
  updateEvaluationProcess(
    evaluation: ReadEvaluationProcess
  ): Observable<ReadEvaluationProcess> {
    return this.http.put<ReadEvaluationProcess>(
      `${this.apiUrl}/${this.endpoint}/${evaluation.id}`,
      evaluation
    );
  }
  deleteEvaluationProcess(id: string): Observable<ReadEvaluationProcess> {
    return this.http.delete<ReadEvaluationProcess>(
      `${this.apiUrl}/${this.endpoint}/${id}`
    );
  }
}
