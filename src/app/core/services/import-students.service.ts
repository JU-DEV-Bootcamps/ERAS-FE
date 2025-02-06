import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImportStudentService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Students';

  constructor(private http: HttpClient) {}

  postData(data: unknown): Observable<any> {
    // we should define a good interface for this situations
    return this.http.post(`${this.apiUrl}/${this.endpoint}`, data);
  }
}
