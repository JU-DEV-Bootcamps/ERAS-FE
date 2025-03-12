/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentPoll } from '../../shared/models/polls/student-polls.model';

@Injectable({
  providedIn: 'root',
})
export class PollService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Polls';
  private cosmicLattePath = 'api/v1/CosmicLatte/polls';

  constructor(private http: HttpClient) {}

  getAllPolls(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}`);
  }

  getPollsByCohortId(cohortId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/cohort/${cohortId}`);
  }

  savePollsCosmicLattePreview(data: any) {
    return this.http.post(`${this.apiUrl}/${this.cosmicLattePath}`, data);
  }

  getPollsByStudentId(studentId: number): Observable<StudentPoll[]> {
    return this.http.get<StudentPoll[]>(
      `${this.apiUrl}/${this.endpoint}/student/${studentId}`
    );
  }
}
