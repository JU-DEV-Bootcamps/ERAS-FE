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
import { CohortComponents } from '../../../shared/models/cohort/cohort-components.model';
import { CohortStudentsRiskByPollResponse } from '../../models/cohort.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService extends BaseApiService {
  protected resource = 'Students';

  getStudentDetailsById(studentId: number) {
    return this.get<StudentResponse>(studentId);
  }
  getAllStudents() {
    return this.get<StudentModel[]>('');
  }
  getAllStudentsCount() {
    return this.get<number>('count');
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

  getPollComponentsAvg(pollUuid: string) {
    return this.get<CohortComponents[]>(`poll/${pollUuid}/components/avg`);
  }

  getPollComponentTopStudents(
    pollUuid: string,
    componentName: string,
    cohortId: number
  ) {
    return this.get<CohortStudentsRiskByPollResponse[]>(
      `${cohortId}/poll/${pollUuid}/components/top`,
      new HttpParams().set('componentName', componentName)
    );
  }

  getPollTopStudents(pollUuid: string, cohortId: number) {
    return this.get<CohortStudentsRiskByPollResponse[]>(
      `${cohortId}/poll/${pollUuid}/top`
    );
  }

  getPollStudentsRiskSum(pollUuid: string, cohortId: number) {
    return this.get<CohortStudentsRiskByPollResponse[]>(
      `${cohortId}/poll/${pollUuid}/sum`
    );
  }
}
