import { Injectable } from '@angular/core';
import {
  CreateEvaluationModel,
  PagedReadEvaluationProcess,
} from '../../models/evaluation-request.model';
import { EvaluationModel } from '../../models/evaluation.model';
import { BaseApiService } from './base-api.service';
import { HttpParams } from '@angular/common/http';
import { GetQueryResponse } from '../../models/summary.model';

@Injectable({
  providedIn: 'root',
})
export class EvaluationsService extends BaseApiService {
  protected resource = 'evaluations';

  getEvalProcDetails(id: number) {
    return this.get<GetQueryResponse<EvaluationModel>>(id);
  }
  createEvalProc(data: CreateEvaluationModel, parentId: string) {
    return this.post(parentId, data);
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
