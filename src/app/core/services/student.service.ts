/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentResponse } from '../models/student-request.model';
import { StudentRiskAverage } from './interfaces/student.interface';
import { CohortStudentsRiskByPollResponse } from '../models/cohort.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Students';

  constructor(private http: HttpClient) {}

  getStudentDetailsById(studentId: number): Observable<StudentResponse> {
    const params = new HttpParams().set('studentId', studentId);
    const url = `${this.apiUrl}/${this.endpoint}/studentId?studentId=${studentId}`;
    return this.http.get<StudentResponse>(url, { params });
  }
  getAllStudents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}`);
  }
  getAllStudentsCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/count`);
  }
  getAllAverageByCohortAndPoll({
    cohortId,
    pollId,
  }: {
    cohortId: number;
    pollId: number;
  }) {
    return this.http.get<StudentRiskAverage[]>(
      `${this.apiUrl}/${this.endpoint}/average/cohort/${cohortId}/poll/${pollId}`
    );
  }

  getCohortStudentsRisk(
    pollUuid: string,
    cohortId: number
  ): Observable<CohortStudentsRiskByPollResponse[]> {
    const params = new HttpParams().set('CohortId', cohortId);
    const url = `${this.apiUrl}/${this.endpoint}/polls/${pollUuid}/top`;
    return this.http.get<CohortStudentsRiskByPollResponse[]>(url, { params });
  }

  getCohortStudentsRiskByPoll(
    pollUuid: string,
    componentName: string,
    cohortId: number
  ): Observable<CohortStudentsRiskByPollResponse[]> {
    const params = new HttpParams()
      .set('ComponentName', componentName)
      .set('CohortId', cohortId);
    const url = `${this.apiUrl}/${this.endpoint}/polls/${pollUuid}/components/top`;
    return this.http.get<CohortStudentsRiskByPollResponse[]>(url, { params });
  }
}
