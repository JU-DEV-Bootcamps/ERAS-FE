import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImportStudentService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Students';

  constructor(private http: HttpClient) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postData(data: unknown): Observable<any> {
    // we should define a good interface for this situations
    return this.http.post(`${this.apiUrl}/${this.endpoint}`, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getData({ page = 1, pageSize = 10 }): Observable<any> {
    const params = new HttpParams().set('PageSize', pageSize).set('Page', page);
    return this.http.get(`${this.apiUrl}/${this.endpoint}`, { params });
  }
}
