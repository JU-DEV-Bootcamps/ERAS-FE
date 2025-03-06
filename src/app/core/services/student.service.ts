import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentDetails } from '../../shared/models/student/studentDetails.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/students';

  constructor(private http: HttpClient) {}

  getStudentDetailsById(studentId: string): Observable<StudentDetails> {
    const params = new HttpParams().set('studentId', studentId);
    const url = `${this.apiUrl}/${this.endpoint}/studentId?studentId=${studentId}`;
    return this.http.get<StudentDetails>(url, {params});
  }

}
