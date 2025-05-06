import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { PollModel } from '../../models/poll.model';
import { PollVariableModel } from '../../models/poll-variable.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PollService extends BaseApiService {
  protected resource = 'api/v1/Polls';

  getAllPolls() {
    return this.get<PollModel[]>('');
  }

  getPollsByCohortId(cohortId: number) {
    const params = new HttpParams().set('CohortId', cohortId);
    return this.get<PollModel[]>('', params);
  }

  getByCohortAndPoll(cohortId: number, pollId: number) {
    const params = new HttpParams().set('CohortId', cohortId);
    return this.get<PollVariableModel[]>(`${pollId}`, params);
  }

  getPollsByStudentId(studentId: number) {
    const params = new HttpParams().set('studentId', studentId);
    return this.get<PollModel[]>('', params);
  }
}
