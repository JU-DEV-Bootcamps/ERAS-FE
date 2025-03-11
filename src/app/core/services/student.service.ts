/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentRiskAverage } from './Types/student.type';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Students';

  constructor(private http: HttpClient) {}

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
}
