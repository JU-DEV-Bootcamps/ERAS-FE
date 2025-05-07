import { HttpParams } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';
import {
  GetQueryResponse,
  PollAvgReport,
  PollTopReport,
} from '../../models/summary.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReportService extends BaseApiService {
  protected resource = 'Reports';

  getTopPollReport(variableIds: number[], pollUuiD: string, take?: number) {
    let params = new HttpParams().set('variableIds', variableIds.join(','));
    if (take !== undefined && take !== null) {
      params = params.set('take', take);
    }
    return this.get<ApiResponse<PollTopReport>>(
      `polls/${pollUuiD}/top`,
      params
    );
  }

  getAvgPoolReport(pollInstanceUUID: string, cohortId: number | null) {
    let params = new HttpParams();
    if (cohortId != null) params = params.set('cohortId', cohortId);
    return this.get<GetQueryResponse<PollAvgReport>>(
      `polls/${pollInstanceUUID}/avg`,
      params
    );
  }

  getHMSeriesFromAvgReport(body: PollAvgReport) {
    const series = body.components.map(component => {
      return {
        name: `${component.description}\n RISK AVG: ${component.averageRisk.toFixed(2)}`,
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
