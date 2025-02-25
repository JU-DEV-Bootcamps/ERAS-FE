import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GetResponse } from '../../shared/models/eras-api/eras.api';
import { environment } from '../../../environments/environment';

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
}
