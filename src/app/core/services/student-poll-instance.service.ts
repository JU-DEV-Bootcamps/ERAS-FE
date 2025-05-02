import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { StudentModel } from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Students';

  constructor(private http: HttpClient) {}

  update(data: StudentModel) {
    console.log('update');
    console.log(data);
    return this.http.patch<StudentModel>(
      `${this.apiUrl}/${this.endpoint}`,
      data
    );
  }

  remove(id: number) {
    return this.http.delete<StudentModel>(
      `${this.apiUrl}/${this.endpoint}/${id}`
    );
  }
}
