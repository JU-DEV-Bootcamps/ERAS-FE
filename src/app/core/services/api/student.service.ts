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
import { sortArray } from '../../utils/helpers/sort';

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
    const params = new HttpParams().set('PageSize', 9999).set('Page', 0);
    return this.get<PagedResult<StudentModel>>('', params);
  }

  getAllAverageByCohortsAndPoll({
    page,
    pageSize,
    cohortIds,
    pollUuid,
    lastVersion,
    evaluationId,
  }: {
    cohortIds: number[];
    page: number;
    pageSize: number;
    pollUuid: string;
    lastVersion: boolean;
    evaluationId?: number | string;
  }) {
    let params = new HttpParams()
      .set('cohortIds', this.arrayAsStringParams(cohortIds))
      .set('pollUuid', pollUuid)
      .set('page', page)
      .set('pageSize', pageSize)
      .set('lastVersion', lastVersion);

    if (cohortIds && cohortIds.length > 0) {
      params = params.set('cohortIds', this.arrayAsStringParams(cohortIds));
    }

    if (
      evaluationId !== undefined &&
      evaluationId !== null &&
      evaluationId !== ''
    ) {
      params = params.set('evaluationId', evaluationId.toString());
    }

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
    lastVersion: boolean,
    pageSize: number,
    page: number
  ) {
    return this.get<PagedResult<StudentRiskResponse>>(
      `polls/${pollUuid}/components/top`,
      new HttpParams()
        .set('componentName', componentName)
        .set('cohortId', cohortId)
        .set('LastVersion', lastVersion)
        .set('PageSize', pageSize.toString())
        .set('Page', page.toString())
    );
  }

  getPollTopStudents(
    pollUuid: string,
    cohortId: number,
    lastVersion: boolean,
    pageSize: number,
    page: number
  ) {
    const params = new HttpParams()
      .set('CohortId', cohortId)
      .set('LastVersion', lastVersion)
      .set('PageSize', pageSize.toString())
      .set('Page', page.toString());
    return this.get<PagedResult<StudentRiskResponse>>(
      `polls/${pollUuid}/top`,
      params
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
    cohortId: number,
    pageSize: number,
    page: number
  ) {
    return this.get<StudentRiskResponse[]>(
      `/polls/${pollUuid}/components/top`,
      new HttpParams()
        .set('ComponentName', componentName)
        .set('CohortId', cohortId)
        .set('PageSize', pageSize.toString())
        .set('Page', page.toString())
    );
  }
}
