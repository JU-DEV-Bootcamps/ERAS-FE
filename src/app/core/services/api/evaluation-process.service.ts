import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EvaluationSummaryModel } from '../../models/summary.model';
import {
  CreateEvaluationModel,
  PagedReadEvaluationProcess,
} from '../../models/evaluation-request.model';
import { EvaluationModel } from '../../models/evaluation.model';
import { BaseApiService } from './base-api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EvaluationProcessService extends BaseApiService {
  protected resource = 'api/v1/Evaluation';

  getEvalProcSummary(): Observable<EvaluationSummaryModel> {
    return this.http.get<EvaluationSummaryModel>(`/summary`);
  }
  createEvalProc(data: CreateEvaluationModel): Observable<unknown> {
    return this.http.post('', data);
  }
  getAllEvalProc({
    page = 1,
    pageSize = 10,
  }): Observable<PagedReadEvaluationProcess> {
    const params = new HttpParams().set('PageSize', pageSize).set('Page', page);
    return this.get<PagedReadEvaluationProcess>('', params);
  }
  updateEvaluationProcess(
    evaluation: EvaluationModel
  ): Observable<EvaluationModel> {
    return this.put(evaluation.id, evaluation);
  }
  deleteEvaluationProcess(id: string): Observable<EvaluationModel> {
    return this.delete<EvaluationModel>(id);
  }
}
