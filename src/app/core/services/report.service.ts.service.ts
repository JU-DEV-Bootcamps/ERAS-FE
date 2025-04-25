import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { GetResponse } from '../models/get-response.model';

interface StudentRisk {
  name: string;
  answer: string;
  risk: number;
}

interface GetResponseRisk<T> {
  body: T;
  status: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly http: HttpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Reports`;

  getStudentsDetailByVariables(
    variableId: number,
    pollInstanceUUID: string,
    take: number | null
  ) {
    let params = new HttpParams()
      .set('variableId', variableId)
      .set('pollInstanceUuid', pollInstanceUUID);

    if (take !== undefined && take !== null) {
      params = params.set('take', take);
    }

    return this.http.get<GetResponse<unknown>>(
      `${this.apiUrl}/higherrisk/byVariable`,
      { params }
    );
  }

  getStudentsDetailByPool(
    pollInstanceUUID: string,
    take: number | null,
    variableIds: number[]
  ) {
    let params = new HttpParams()
      .set('variableIds', variableIds.join(','))
      .set('pollInstanceUuid', pollInstanceUUID);

    if (take !== undefined && take !== null) {
      params = params.set('take', take);
    }

    return this.http.get<GetResponseRisk<StudentRisk[]>>(
      `${this.apiUrl}/higherrisk/byPoll`,
      { params }
    );
  }
}
