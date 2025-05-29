import { HttpParams } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';
import {
  GetQueryResponse,
  PollAvgReport,
  PollCountComponent,
  PollCountReport,
  PollTopReport,
} from '../../models/summary.model';
import { Injectable } from '@angular/core';
import { RiskLevel } from '../../models/common/risk.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService extends BaseApiService {
  protected resource = 'reports';

  getTopPollReport(variableIds: number[], pollUuiD: string, take?: number) {
    let params = new HttpParams().set(
      'variableIds',
      this.arrayAsStringParams(variableIds)
    );
    if (take !== undefined && take !== null) {
      params = params.set('take', take);
    }
    return this.get<ApiResponse<PollTopReport>>(
      `polls/${pollUuiD}/top`,
      params
    );
  }

  getAvgPoolReport(pollInstanceUUID: string, cohortIds: number[]) {
    let params = new HttpParams();
    if (cohortIds.length > 0)
      params = params.set('cohortIds', this.arrayAsStringParams(cohortIds));
    return this.get<GetQueryResponse<PollAvgReport>>(
      `polls/${pollInstanceUUID}/avg`,
      params
    );
  }

  getCountPoolReport(
    pollInstanceUuid: string,
    cohortIds: number[] | null,
    variableIds: number[]
  ) {
    let params = new HttpParams().set(
      'variableIds',
      this.arrayAsStringParams(variableIds)
    );
    if (cohortIds != null)
      params = params.set(
        'cohortIds',
        cohortIds.join(',').replace(/^,+|,+$/g, '')
      );
    return this.get<GetQueryResponse<PollCountReport>>(
      `polls/${pollInstanceUuid}/count`,
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
            z: question.answersDetails
              .map(
                ans =>
                  `${ans.answerPercentage}% = ${this.addAnswerSeparator(ans.answerText)}: ${this.arrayAsStringParams(ans.studentsEmails)}`
              )
              .join('; </br>'),
          };
        }),
      };
    });
    return series;
  }

  getHMSeriesFromCountReport(body: PollCountReport) {
    const compTest = body.components.map(c => c.questions);
    const compTestFlat = compTest.reduce((acc, val) => acc.concat(val), []);
    const series = compTestFlat.map(question => {
      return {
        name: `${question.question}`,
        data: question.answers.map(a => {
          return {
            x: a.answerRisk,
            y: a.answerRisk,
            z: `${a.count} answers with risk ${a.answerRisk} for: ${a.answerText}`,
          };
        }),
      };
    });
    return series;
  }

  getHMSeriesFromCountComponent(component: PollCountComponent) {
    const series = component.questions.map(question => {
      return {
        name: `${question.question}`,
        data: question.answers.map(a => {
          return {
            x: a.answerRisk,
            y: a.answerRisk,
            z: `${a.count} answers with risk ${a.answerRisk} for: ${a.answerText}`,
          };
        }),
      };
    });
    return series;
  }
  getSummaryPollReport(pollUuiD: string) {
    return this.get<ApiResponse<unknown>>(`polls/${pollUuiD}/summary`);
  }

  getBMSeriesFromSummaryReport(risks: number[]) {
    const record: Record<RiskLevel, number> = {
      'No Answer': 0,
      'Low Risk': 0,
      'Low-Medium Risk': 0,
      'Medium Risk': 0,
      'Medium-High Risk': 0,
      'High Risk': 0,
    };

    risks.forEach(risk => {
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
    });

    return {
      risks: Object.values(record),
      levels: Object.keys(record) as RiskLevel[],
    };
  }

  addAnswerSeparator(text: string): string {
    return text.replace(/(?!^)([A-Z])/g, ' - $1');
  }
}
