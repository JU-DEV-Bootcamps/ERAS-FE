import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentPoll } from '../../shared/models/polls/student-polls.model';

@Injectable({
  providedIn: 'root',
})
export class PollsService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Polls';

  constructor(private http: HttpClient) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPollsByCohortId(cohortId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/cohort/${cohortId}`);
  }

  getPollsByStudentId(studentId: number): Observable<StudentPoll[]> {
    return this.http.get<StudentPoll[]>(
      `${this.apiUrl}/${this.endpoint}/student/${studentId}`
    );
  }
}
