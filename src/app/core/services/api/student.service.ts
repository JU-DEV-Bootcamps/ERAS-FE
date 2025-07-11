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
import { map, Observable } from 'rxjs';
import { StudentRiskResponse } from '../../models/cohort.model';
import { AnswerResponse } from '../../models/answer-request.model';
import { sortArray } from '../../utilities/sort';

@Injectable({
  providedIn: 'root',
})
export class StudentService extends BaseApiService {
  protected resource = 'students';

  getStudentDetailsById(studentId: number, pagination: Pagination) {
    const params = new HttpParams()
      .set('PageSize', pagination.pageSize)
      .set('Page', pagination.page);
    return this.get<StudentResponse>(studentId, params);
  }

  getAllStudents() {
    return this.get<StudentModel[]>('');
  }

  getAllAverageByCohortsAndPoll({
    page,
    pageSize,
    cohortIds,
    pollUuid,
    lastVersion,
  }: {
    cohortIds: number[];
    page: number;
    pageSize: number;
    pollUuid: string;
    lastVersion: boolean;
  }) {
    const params = new HttpParams()
      .set('cohortIds', this.arrayAsStringParams(cohortIds))
      .set('pollUuid', pollUuid)
      .set('page', page)
      .set('pageSize', pageSize)
      .set('lastVersion', lastVersion);
    return this.get<PagedResult<StudentRiskAverage>>('average', params).pipe(
      map(result => {
        result.items = sortArray(result.items, 'studentName');
        return result;
      })
    );
  }

  postData(data: StudentImport[]): Observable<ServerResponse> {
    return this.post('', data);
  }

  getData({ page = 1, pageSize = 10 }: Pagination) {
    const params = new HttpParams().set('PageSize', pageSize).set('Page', page);
    return this.get<PagedResult<StudentModel>>('', params).pipe(
      map(result => {
        result.items = sortArray(result.items, 'name');
        return result;
      })
    );
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
    cohortId: number,
    lastVersion: boolean
  ) {
    return this.get<StudentRiskResponse[]>(
      `polls/${pollUuid}/components/top`,
      new HttpParams()
        .set('componentName', componentName)
        .set('cohortId', cohortId)
        .set('LastVersion', lastVersion)
    );
  }

  getPollTopStudents(pollUuid: string, cohortId: number, lastVersion: boolean) {
    const params = new HttpParams()
      .set('CohortId', cohortId)
      .set('LastVersion', lastVersion);
    return this.get<StudentRiskResponse[]>(`polls/${pollUuid}/top`, params);
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
      .set('Page', pagination.page);

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
