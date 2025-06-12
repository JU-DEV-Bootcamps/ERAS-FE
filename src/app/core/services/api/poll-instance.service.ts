import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../models/api-response.model';
import { PollInstanceModel } from '../../models/poll-instance.model';
import { ServerResponse } from '../interfaces/server.type';
import { BaseApiService } from './base-api.service';
import { ComponentsAvgModel } from '../../models/components-avg.model';
import { ComponentsAvgGroupedByCohortsModel } from '../../models/reports/avg-reports';
import { PagedResult } from '../interfaces/page.type';

@Injectable({
  providedIn: 'root',
})
export class PollInstanceService extends BaseApiService {
  protected resource = 'poll-instances';

  getPollInstancesByLastDays(lastDays: number) {
    const params = new HttpParams().set('lastDays', lastDays);
    return this.get<ServerResponse>('', params);
  }

  getPollInstancesByFilters({
    cohortIds,
    lastDays = 400,
    page,
    pageSize,
    lastVersion,
    pollUuid,
  }: {
    cohortIds: number[];
    lastDays?: number;
    page: number;
    pageSize: number;
    lastVersion: boolean;
    pollUuid: string;
  }) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('days', lastDays)
      .set('lastVersion', lastVersion)
      .set('pollUuid', pollUuid);

    cohortIds.forEach(id => {
      params = params.append('cohortId', id);
    });

    return this.get<ApiResponse<PagedResult<PollInstanceModel>>>(
      pollUuid,
      params
    );
  }

  getAllPollInstances() {
    return this.get<ServerResponse>('');
  }

  getComponentsAvgGroupedByCohorts(pollUuid: string, lastVersion: boolean) {
    const params = new HttpParams().set('lastVersion', lastVersion);
    return this.get<ComponentsAvgGroupedByCohortsModel>(
      `${pollUuid}/cohorts/avg`,
      params
    );
  }

  getComponentsRiskByPollForStudent(studentId: number, pollUuid: number) {
    const params = new HttpParams().set('studentId', studentId);
    return this.get<ComponentsAvgModel[]>(`${pollUuid}/avg`, params);
  }
}
