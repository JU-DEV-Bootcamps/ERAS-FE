import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PollModel } from '../models/poll.model';
import { PollVariableModel } from '../models/poll-variable.model';

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Polls';
  private cosmicLattePath = 'api/v1/CosmicLatte/polls';

  constructor(private http: HttpClient) {}

  getAllPolls(): Observable<PollModel[]> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}`) as Observable<
      PollModel[]
    >;
  }

  getPollsByCohortId(cohortId: number): Observable<PollModel[]> {
    return this.http.get(
      `${this.apiUrl}/${this.endpoint}/cohort/${cohortId}`
    ) as Observable<PollModel[]>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  savePollsCosmicLattePreview(data: any) {
    return this.http.post(`${this.apiUrl}/${this.cosmicLattePath}`, data);
  }

  getByCohortAndPoll(cohortId: number, pollId: number) {
    return this.http.get<PollVariableModel[]>(
      `${this.apiUrl}/${this.endpoint}/${pollId}/cohort/${cohortId}`
    );
  }

  getPollsByStudentId(studentId: number): Observable<PollModel[]> {
    return this.http.get<PollModel[]>(
      `${this.apiUrl}/${this.endpoint}/student/${studentId}`
    );
  }
}
