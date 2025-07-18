import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { PollModel } from '../../models/poll.model';
import { PollVariableModel } from '../../models/poll-variable.model';
import { HttpParams } from '@angular/common/http';
import { VariableModel } from '../../models/variable.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PollService extends BaseApiService {
  protected resource = 'polls';
  pollsCache$: Observable<PollModel[]> | null = null;

  clearCache() {
    this.pollsCache$ = null;
  }

  getAllPolls() {
    if (this.pollsCache$) return this.pollsCache$;
    return (this.pollsCache$ = this.get<PollModel[]>(''));
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
  getVariablesByComponents(
    pollUuid: string,
    components: string[],
    lastVersion: boolean
  ) {
    let params = new HttpParams();
    components.forEach(component => {
      params = params.append('component', component);
    });
    params = params.append('lastVersion', lastVersion);
    return this.get<VariableModel[]>(`${pollUuid}/variables`, params);
  }
}
