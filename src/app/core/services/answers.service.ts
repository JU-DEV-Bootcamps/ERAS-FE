import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Answer } from '../../shared/models/answers/answer.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnswersService {
 private apiUrl = environment.apiUrl;
  private endpoint = 'api/Answers';

  constructor(private http: HttpClient) {}

  getStudentAnswersByPoll(studentId: number, pollId: number): Observable<Answer[]> {
    const params = new HttpParams().set('studentId', studentId).set('pollId', pollId);
    const url = `${this.apiUrl}/${this.endpoint}/getStudentAnswersByPoll`;
    return this.http.get<Answer[]>(url, { params });
  }

}
