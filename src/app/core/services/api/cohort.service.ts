import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import {
  CohortModel,
  CohortStudentsRiskByPollResponse,
} from '../../models/cohort.model';
import { CohortsSummaryModel } from '../../models/summary.model';
import { BaseApiService } from './base-api.service';
import { CohortComponents } from '../../../shared/models/cohort/cohort-components.model';

@Injectable({
  providedIn: 'root',
})
export class CohortService extends BaseApiService {
  protected resource = 'api/v1/Cohorts';

  getCohorts(): Observable<CohortModel[]> {
    return this.get<CohortModel[]>('');
  }

  getCohortsSummary(): Observable<CohortsSummaryModel> {
    return this.get<CohortsSummaryModel>('summary');
  }

  getCohortComponents(pollUuid: string): Observable<CohortComponents[]> {
    const params = new HttpParams().set('PollUuid', pollUuid);
    return this.get<CohortComponents[]>('componentsAvg', params);
  }

  getCohortStudentsRiskByPoll(
    pollUuid: string,
    componentName: string,
    cohortId: number
  ): Observable<CohortStudentsRiskByPollResponse[]> {
    const params = new HttpParams()
      .set('PollUuid', pollUuid)
      .set('ComponentName', componentName)
      .set('CohortId', cohortId);
    return this.get<CohortStudentsRiskByPollResponse[]>(
      'studentsRiskByComponent',
      params
    );
  }

  getCohortStudentsRisk(
    pollUuid: string,
    cohortId: number
  ): Observable<CohortStudentsRiskByPollResponse[]> {
    const params = new HttpParams()
      .set('PollUuid', pollUuid)
      .set('CohortId', cohortId);
    return this.get<CohortStudentsRiskByPollResponse[]>(
      'studentsRiskList',
      params
    );
  }
}
