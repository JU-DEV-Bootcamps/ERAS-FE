import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnswerResponse } from '../models/answer-request.model';

@Injectable({
  providedIn: 'root',
})
export class AnswersService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/Answers';

  constructor(private http: HttpClient) {}

  getStudentAnswersByPoll(
    studentId: number,
    pollId: number
  ): Observable<AnswerResponse[]> {
    const params = new HttpParams()
      .set('studentId', studentId)
      .set('pollId', pollId);
    const url = `${this.apiUrl}/${this.endpoint}/answers`;
    return this.http.get<AnswerResponse[]>(url, { params });
  }
}
