import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentImport } from './Types/student.type';
import { ServerResponse } from './Types/server.type';
import { PagedResult } from './Types/page.type';
import { Student } from './Types/pollInstance';

@Injectable({
  providedIn: 'root',
})
export class ImportStudentService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/v1/Students';

  constructor(private http: HttpClient) {}

  postData(data: StudentImport[]): Observable<ServerResponse> {
    return this.http.post(
      `${this.apiUrl}/${this.endpoint}`,
      data
    ) as Observable<ServerResponse>;
  }

  getData({ page = 1, pageSize = 10 }): Observable<PagedResult<Student>> {
    const params = new HttpParams().set('PageSize', pageSize).set('Page', page);
    return this.http.get(`${this.apiUrl}/${this.endpoint}`, {
      params,
    }) as Observable<PagedResult<Student>>;
  }

  getDataStudentsByPoll({
    days = 30,
    pollUuid = '',
    page = 1,
    pageSize = 10,
  }): Observable<ServerResponse> {
    const params = new HttpParams()
      .set('days', days)
      .set('PageSize', pageSize)
      .set('Page', page);
    return this.http.get(`${this.apiUrl}/${this.endpoint}/poll/${pollUuid}`, {
      params,
    }) as Observable<ServerResponse>;
  }
}
