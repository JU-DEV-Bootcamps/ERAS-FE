import { HttpParams } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';
import {
  GetQueryResponse,
  PollAvgReport,
  PollTopReport,
} from '../../models/summary.model';
import { Injectable } from '@angular/core';
import { AnswersRisks, RiskLevel } from '../../models/common/risk.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService extends BaseApiService {
  protected resource = 'reports';

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
                  `${ans.answerPercentage}% = ${this.addAnswerSeparator(ans.answerText)}: ${ans.studentsEmails.join(', ')}`
              )
              .join('; </br>'),
          };
        }),
      };
    });
    return series;
  }

  getSummaryPollReport(pollUuiD: string) {
    return this.get<ApiResponse<unknown>>(`polls/${pollUuiD}/summary`);
  }

  getBMSeriesFromSummaryReport(body: AnswersRisks) {
    const record: Record<RiskLevel, number> = {
      'No Answer': 0,
      'Low Risk': 0,
      'Low-Medium Risk': 0,
      'Medium Risk': 0,
      'Medium-High Risk': 0,
      'High Risk': 0,
    };

    for (const risk of body.risks) {
      if (risk >= 1 && risk <= 2) {
        record['Low Risk']++;
      } else if (risk >= 2 && risk <= 3) {
        record['Low-Medium Risk']++;
      } else if (risk >= 3 && risk <= 4) {
        record['Medium Risk']++;
      } else if (risk >= 4 && risk <= 5) {
        record['Medium-High Risk']++;
      } else if (risk >= 5 && risk <= 10) {
        record['High Risk']++;
      } else {
        record['No Answer']++;
      }
    }

    return {
      risks: Object.values(record),
      levels: Object.keys(record) as RiskLevel[],
    };
  }

  addAnswerSeparator(texto: string): string {
    return texto.replace(/(?!^)([A-Z])/g, ' - $1');
  }
}
