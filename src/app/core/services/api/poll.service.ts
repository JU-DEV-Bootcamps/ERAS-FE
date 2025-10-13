import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { PollModel } from '../../models/poll.model';
import { PollVariableModel } from '../../models/poll-variable.model';
import { VariableModel } from '../../models/variable.model';

import { sortArray } from '@core/utilities/sort';
import { BaseApiService } from './base-api.service';

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

    this.pollsCache$ = this.get<PollModel[]>('').pipe(
      map(polls => sortArray(polls, 'name'))
    );

    return this.pollsCache$;
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
