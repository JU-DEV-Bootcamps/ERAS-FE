import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { HttpParams } from '@angular/common/http';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';

@Injectable({
  providedIn: 'root',
})
export class EvaluationDetailsService extends BaseApiService {
  protected resource = 'evaluations';

  getStudentsByFilters(
    pollUuid: string,
    componentNames: string[],
    cohortIds: number[],
    variableIds: number[],
    riskLevels?: number[]
  ) {
    let params = new HttpParams().set('PollUuid', pollUuid);

    const appendArray = (name: string, items: (string | number)[]) => {
      if (items && items.length > 0) {
        items.forEach(item => {
          params = params.append(name, item.toString());
        });
      }
    };

    appendArray('ComponentNames', componentNames);
    appendArray('CohortIds', cohortIds);

    if (variableIds && variableIds.length > 0) {
      appendArray('VariableIds', variableIds);
    }

    if (riskLevels && riskLevels.length > 0) {
      appendArray('RiskLevels', riskLevels);
    }

    return this.get<EvaluationDetailsStudentResponse[]>(
      `StudentsByFilters`,
      params
    );
  }
}
