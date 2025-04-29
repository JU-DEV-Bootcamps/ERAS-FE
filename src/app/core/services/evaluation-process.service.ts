import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluationSummaryModel } from '../models/summary.model';
import {
  CreateEvaluationModel,
  PagedReadEvaluationProcess,
} from '../models/evaluation-request.model';
import { EvaluationModel } from '../models/evaluation.model';

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
  createEvalProc(data: CreateEvaluationModel): Observable<unknown> {
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
    evaluation: EvaluationModel
  ): Observable<EvaluationModel> {
    return this.http.put<EvaluationModel>(
      `${this.apiUrl}/${this.endpoint}/${evaluation.id}`,
      evaluation
    );
  }
  deleteEvaluationProcess(id: string): Observable<EvaluationModel> {
    return this.http.delete<EvaluationModel>(
      `${this.apiUrl}/${this.endpoint}/${id}`
    );
  }
}
