import { Injectable } from '@angular/core';
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
export class EvaluationsService extends BaseApiService {
  protected resource = 'evaluations';

  getEvalProcSummary() {
    return this.get<EvaluationSummaryModel>(`summary`);
  }
  createEvalProc(data: CreateEvaluationModel) {
    return this.post('', data);
  }
  getAllEvalProc({ page = 1, pageSize = 10 }) {
    const params = new HttpParams().set('PageSize', pageSize).set('Page', page);
    return this.get<PagedReadEvaluationProcess>('', params);
  }
  updateEvaluationProcess(evaluation: EvaluationModel) {
    return this.put<EvaluationModel>(evaluation.id, evaluation);
  }
  deleteEvaluationProcess(id: string) {
    return this.delete<EvaluationModel>(id);
  }
}
