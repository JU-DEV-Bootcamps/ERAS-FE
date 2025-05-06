import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StudentResponse } from '../../models/student-request.model';
import { StudentRiskAverage } from '../interfaces/student.interface';
import { BaseApiService } from './base-api.service';
import { StudentModel } from '../../models/student.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StudentService extends BaseApiService {
  protected resource = 'api/v1/Students';

  getStudentDetailsById(studentId: number): Observable<StudentResponse> {
    return this.get(studentId);
  }
  getAllStudents(): Observable<StudentModel[]> {
    return this.get('');
  }
  getAllStudentsCount(): Observable<number> {
    return this.get('count');
  }
  getAllAverageByCohortAndPoll(cohortId: number, pollId: number) {
    const params = new HttpParams()
      .set('cohortId', cohortId)
      .set('pollId', pollId);
    return this.get<StudentRiskAverage[]>('average', params);
  }
}
