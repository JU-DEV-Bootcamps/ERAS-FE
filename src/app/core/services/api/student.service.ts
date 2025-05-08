import { Injectable } from '@angular/core';
import { StudentResponse } from '../../models/student-request.model';
import {
  StudentImport,
  StudentRiskAverage,
} from '../interfaces/student.interface';
import { BaseApiService } from './base-api.service';
import { StudentModel } from '../../models/student.model';
import { HttpParams } from '@angular/common/http';
import { ServerResponse } from '../interfaces/server.type';
import { PagedResult } from '../interfaces/page.type';
import { Observable } from 'rxjs';
import { CohortStudentsRiskByPollResponse } from '../../models/cohort.model';
import { AnswerResponse } from '../../models/answer-request.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService extends BaseApiService {
  protected resource = 'students';

  getStudentDetailsById(studentId: number) {
    return this.get<StudentResponse>(studentId);
  }
  getAllStudents() {
    return this.get<StudentModel[]>('');
  }

  getAllAverageByCohortAndPoll(cohortId: number, pollId: number) {
    const params = new HttpParams()
      .set('cohortId', cohortId)
      .set('pollId', pollId);
    return this.get<StudentRiskAverage[]>('average', params);
  }
  postData(data: StudentImport[]): Observable<ServerResponse> {
    return this.post('', data);
  }

  getData({ page = 1, pageSize = 10 }) {
    const params = new HttpParams().set('PageSize', pageSize).set('Page', page);
    return this.get<PagedResult<StudentModel>>('', params);
  }

  getDataStudentsByPoll({ days = 30, pollUuid = '', page = 1, pageSize = 10 }) {
    const params = new HttpParams()
      .set('days', days)
      .set('PageSize', pageSize)
      .set('Page', page);
    return this.get<ServerResponse>(`poll/${pollUuid}`, params);
  }

  getPollComponentTopStudents(
    pollUuid: string,
    componentName: string,
    cohortId: number
  ) {
    return this.get<CohortStudentsRiskByPollResponse[]>(
      `polls/${pollUuid}/components/top`,
      new HttpParams()
        .set('componentName', componentName)
        .set('cohortId', cohortId)
    );
  }

  getPollTopStudents(pollUuid: string, cohortId: number) {
    return this.get<CohortStudentsRiskByPollResponse[]>(
      `polls/${pollUuid}/top`,
      new HttpParams().set('cohortId', cohortId)
    );
  }

  getPollStudentsRiskSum(pollUuid: string, cohortId: number) {
    return this.get<CohortStudentsRiskByPollResponse[]>(
      `polls/${pollUuid}/sum`,
      new HttpParams().set('cohortId', cohortId)
    );
  }

  getStudentAnswersByPoll(studentId: number, pollId: number) {
    return this.get<AnswerResponse[]>(`${studentId}/polls/${pollId}/answers`);
  }
}
