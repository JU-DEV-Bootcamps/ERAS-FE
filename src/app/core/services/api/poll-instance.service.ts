import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../models/api-response.model';
import { PollInstanceModel } from '../../models/poll-instance.model';
import { ServerResponse } from '../interfaces/server.type';
import { BaseApiService } from './base-api.service';
import { AnswerResponse } from '../../models/answer-request.model';
import { ComponentsAvgModel } from '../../models/components-avg.model';

@Injectable({
  providedIn: 'root',
})
export class PollInstanceService extends BaseApiService {
  protected resource = 'api/v1/PollInstances';

  getPollInstancesByLastDays(lastDays: number) {
    const params = new HttpParams().set('lastDays', lastDays);
    return this.get<ServerResponse>('', params);
  }

  getPollInstancesByFilters(cohortId: number, lastDays: number) {
    const params = new HttpParams()
      .set('cohortId', cohortId)
      .set('days', lastDays);
    return this.get<ApiResponse<PollInstanceModel[]>>('', params);
  }

  getAllPollInstances() {
    return this.get<ServerResponse>('');
  }

  getStudentAnswersByPoll(studentId: number, pollId: number) {
    const params = new HttpParams().set('studentId', studentId);
    return this.get<AnswerResponse[]>(`${pollId}/answers`, params);
  }
  getComponentsAvgGroupedByCohorts(pollUuid: string) {
    return this.get(`${pollUuid}/cohorts/avg`);
  }
  getComponentsRiskByPollForStudent(studentId: number, pollUuid: number) {
    const params = new HttpParams().set('studentId', studentId);
    return this.get<ComponentsAvgModel[]>(`${pollUuid}/avg`, params);
  }
}
