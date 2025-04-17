import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GetResponse } from '../../shared/models/eras-api/eras.api';
import { environment } from '../../../environments/environment';
import { PollAvgReport } from '../models/SummaryModel';
import { GetQueryResponse } from '../models/CommonModels';

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

  getTopStudentReport(
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

    return this.http.get<GetResponse<unknown>>(`${this.apiUrl}/students/top`, {
      params,
    });
  }

  getTopPoolReport(
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
      `${this.apiUrl}/polls/top`,
      { params }
    );
  }

  getAvgPoolReport(pollInstanceUUID: string, cohortId: number | null) {
    let params = new HttpParams().set('PollInstanceUuid', pollInstanceUUID);
    if (cohortId != null) params = params.set('cohortId', cohortId);
    console.info('getAvgPoolReport', params);
    return this.http.get<GetQueryResponse<PollAvgReport>>(
      `${this.apiUrl}/polls/avg`,
      { params }
    );
  }

  getHMSeriesFromReport(body: PollAvgReport) {
    const series = body.components.map(component => {
      return {
        name: component.description,
        data: component.questions.map(question => {
          return {
            x: question.question,
            y: question.averageRisk,
          };
        }),
      };
    });
    return series;
  }
}
