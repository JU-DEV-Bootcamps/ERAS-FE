import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnswerResponse } from '../../models/answer-request.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class AnswersService extends BaseApiService {
  protected resource = 'api/Answers';

  getStudentAnswersByPoll(
    studentId: number,
    pollId: number
  ): Observable<AnswerResponse[]> {
    const params = new HttpParams()
      .set('studentId', studentId)
      .set('pollId', pollId);
    return this.get<AnswerResponse[]>('', params);
  }
}
