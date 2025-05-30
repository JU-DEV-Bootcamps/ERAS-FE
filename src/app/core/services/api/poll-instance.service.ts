import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../models/api-response.model';
import { PollInstanceModel } from '../../models/poll-instance.model';
import { ServerResponse } from '../interfaces/server.type';
import { BaseApiService } from './base-api.service';
import { ComponentsAvgModel } from '../../models/components-avg.model';
import { ComponentsAvgGroupedByCohortsModel } from '../../models/reports/avg-reports';

@Injectable({
  providedIn: 'root',
})
export class PollInstanceService extends BaseApiService {
  protected resource = 'poll-instances';

  getPollInstancesByLastDays(lastDays: number) {
    const params = new HttpParams().set('lastDays', lastDays);
    return this.get<ServerResponse>('', params);
  }

  getPollInstancesByFilters(cohortIds: number[], lastDays: number) {
    const params = new HttpParams()
      .set('cohortIds', this.arrayAsStringParams(cohortIds))
      .set('days', lastDays);
    return this.get<ApiResponse<PollInstanceModel[]>>('', params);
  }

  getAllPollInstances() {
    return this.get<ServerResponse>('');
  }

  getComponentsAvgGroupedByCohorts(pollUuid: string) {
    return this.get<ComponentsAvgGroupedByCohortsModel>(
      `${pollUuid}/cohorts/avg`
    );
  }
  getComponentsRiskByPollForStudent(studentId: number, pollUuid: number) {
    const params = new HttpParams().set('studentId', studentId);
    return this.get<ComponentsAvgModel[]>(`${pollUuid}/avg`, params);
  }
}
