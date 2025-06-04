import { Injectable } from '@angular/core';
import { StudentResponse } from '../../models/student-request.model';
import {
  StudentImport,
  StudentRiskAverage,
} from '../interfaces/student.interface';
import { BaseApiService } from './base-api.service';
import { StudentModel } from '../../models/student.model';
import { HttpParams } from '@angular/common/http';
import { Pagination, ServerResponse } from '../interfaces/server.type';
import { PagedResult } from '../interfaces/page.type';
import { Observable } from 'rxjs';
import { StudentRiskResponse } from '../../models/cohort.model';
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

  getAllAverageByCohortsAndPoll(cohortIds: number[], pollUuid: string) {
    const params = new HttpParams()
      .set('cohortIds', cohortIds.join(','))
      .set('pollUuid', pollUuid);
    // Is this endpoint being used? On BE there's a students/avg
    return this.get<StudentRiskAverage[]>('average', params);
  }

  getAllAverageByCohortsAndPollId(cohortIds: number[], pollId: number) {
    const params = new HttpParams()
      .set('cohortIds', cohortIds.join(','))
      .set('pollId', pollId);
    return this.get<StudentRiskAverage[]>('average/poll', params);
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
    return this.get<StudentRiskResponse[]>(
      `polls/${pollUuid}/components/top`,
      new HttpParams()
        .set('componentName', componentName)
        .set('cohortId', cohortId)
    );
  }

  getPollTopStudents(pollUuid: string, cohortId: number) {
    return this.get<StudentRiskResponse[]>(
      `polls/${pollUuid}/top`,
      new HttpParams().set('cohortId', cohortId)
    );
  }

  getPollStudentsRiskSum(pollUuid: string, cohortId: number) {
    return this.get<StudentRiskResponse[]>(
      `polls/${pollUuid}/sum`,
      new HttpParams().set('cohortId', cohortId)
    );
  }

  getStudentAnswersByPoll(
    studentId: number,
    pollId: number,
    pagination: Pagination
  ) {
    const params = new HttpParams()
      .set('PageSize', pagination.pageSize)
      .set('Page', pagination.pageIndex);

    return this.get<PagedResult<AnswerResponse>>(
      `${studentId}/polls/${pollId}/answers`,
      params
    );
  }

  getTopRiskStudents(pollUuid: string, cohortId: number) {
    return this.get<StudentRiskResponse[]>(
      `/polls/${pollUuid}/top`,
      new HttpParams().set('CohortId', cohortId)
    );
  }

  getTopRiskStudentsByComponent(
    pollUuid: string,
    componentName: string,
    cohortId: number
  ) {
    return this.get<StudentRiskResponse[]>(
      `/polls/${pollUuid}/components/top`,
      new HttpParams()
        .set('ComponentName', componentName)
        .set('CohortId', cohortId)
    );
  }
}
