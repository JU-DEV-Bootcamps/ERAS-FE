import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServerResponse } from './interfaces/server.type';
import { PagedResult } from './interfaces/page.type';
import { StudentModel } from '../models/student.model';
import { StudentImport } from './interfaces/student.interface';

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

  getData({ page = 1, pageSize = 10 }): Observable<PagedResult<StudentModel>> {
    const params = new HttpParams().set('PageSize', pageSize).set('Page', page);
    return this.http.get(`${this.apiUrl}/${this.endpoint}`, {
      params,
    }) as Observable<PagedResult<StudentModel>>;
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
