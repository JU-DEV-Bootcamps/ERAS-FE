import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../../shared/models/student/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Students';

  constructor(private http: HttpClient) {}

  getStudentDetailsById(studentId: number): Observable<Student> {
    const params = new HttpParams().set('studentId', studentId);
    const url = `${this.apiUrl}/${this.endpoint}/studentId?studentId=${studentId}`;
    return this.http.get<Student>(url, { params });
  }
  getAllStudents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}`);
  }
  getAllStudentsCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/count`);
  }
}
