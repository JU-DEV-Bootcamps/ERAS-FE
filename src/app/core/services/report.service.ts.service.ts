import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  GetQueryResponse,
  PollAvgReport,
  PollTopReport,
} from '../models/summary.model';

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

  getTopPollReport(
    variableIds: number[],
    pollInstanceUUID: string,
    take: number | null
  ) {
    let params = new HttpParams()
      .set('variableIds', variableIds.join(','))
      .set('pollInstanceUuid', pollInstanceUUID);

    if (take !== undefined && take !== null) {
      params = params.set('take', take);
    }

    return this.http.get<ApiResponse<PollTopReport>>(
      `${this.apiUrl}/polls/top`,
      {
        params,
      }
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

  getAvgPoolReport(pollInstanceUUID: string, cohortId: number | null) {
    let params = new HttpParams().set('PollInstanceUuid', pollInstanceUUID);
    if (cohortId != null) params = params.set('cohortId', cohortId);
    console.info('getAvgPoolReport', params);
    return this.http.get<GetQueryResponse<PollAvgReport>>(
      `${this.apiUrl}/polls/avg`,
      { params }
    );
  }

  getHMSeriesFromAvgReport(body: PollAvgReport) {
    const series = body.components.map(component => {
      return {
        name: component.description + ' = ' + component.averageRisk.toFixed(2),
        data: component.questions.map(question => {
          return {
            x: question.question,
            y: question.averageRisk,
            details: question.answersDetails,
            z: question.answersDetails
              .map(
                ans =>
                  `${ans.answerPercentage}% = ${ans.answerText}: ${ans.studentsEmails.join(', ')}`
              )
              .join('; </br>'),
          };
        }),
      };
    });
    return series;
  }
}
