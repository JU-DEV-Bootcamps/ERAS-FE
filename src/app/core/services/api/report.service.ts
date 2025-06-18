import { HttpParams } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../../models/api-response.model';
import {
  CountSummaryModel,
  GetQueryResponse,
  PollAvgReport,
  PollCountComponent,
  PollCountReport,
  StudentReportAnswerRiskLevel,
} from '../../models/summary.model';
import { Injectable } from '@angular/core';
import { RiskCountReport } from '../../models/common/risk.model';
import { fixedColorRange } from '../../../features/cohort/util/heat-map-config';
import { Serie } from '../../models/heatmap-data.model';
import { RISK_COLORS, RISK_LEVEL } from '../../constants/riskLevel';
import { Pagination } from '../interfaces/server.type';
import { PagedResult } from '../interfaces/page.type';

@Injectable({
  providedIn: 'root',
})
export class ReportService extends BaseApiService {
  protected resource = 'reports';
  getCountSummary() {
    return this.get<ApiResponse<CountSummaryModel>>('count');
  }
  getTopPollReport(
    variableIds: number[],
    pollUuid: string,
    pagination: Pagination
  ) {
    const params = new HttpParams()
      .set('variableIds', this.arrayAsStringParams(variableIds))
      .set('PageSize', pagination.pageSize)
      .set('Page', pagination.page);

    return this.get<ApiResponse<PagedResult<StudentReportAnswerRiskLevel>>>(
      `polls/${pollUuid}/top`,
      params
    );
  }

  getAvgPoolReport(
    pollInstanceUUID: string,
    cohortIds: number[],
    lastVersion: boolean
  ) {
    let params = new HttpParams();
    params = params.set('lastVersion', lastVersion);
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
    variableIds: number[],
    lastVersion: boolean
  ) {
    let params = new HttpParams().set(
      'variableIds',
      this.arrayAsStringParams(variableIds)
    );
    params = params.set('lastVersion', lastVersion);
    if (cohortIds != null)
      params = params.set('cohortIds', this.arrayAsStringParams(cohortIds));
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

    series.forEach(serie => {
      serie.data.sort((a, b) => a.y - b.y);
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
  getRiskCountPollReport(pollUuiD: string) {
    return this.get<ApiResponse<RiskCountReport>>(
      `polls/${pollUuiD}/risk-count`
    );
  }

  getBMSeriesFromSummaryReport(report: RiskCountReport) {
    const orderedRisks = report.risks.sort((a, b) => a.endRange - b.endRange);
    return {
      risks: orderedRisks.map(r => r.count),
      levels: orderedRisks.map(r => `${RISK_LEVEL[r.endRange]} ${r.label}`),
      colors: orderedRisks.map(r => RISK_COLORS[r.endRange]),
    };
  }

  addAnswerSeparator(text: string): string {
    return text.replace(/(?!^)([A-Z])/g, ' - $1');
  }

  getColorKey(value: number) {
    const color = fixedColorRange.find(r => value >= r.from && value < r.to);
    return color?.color ?? '#000000';
  }

  regroupByColor(
    serie: {
      name: string;
      data: Serie[];
    }[]
  ) {
    const rows = [...serie];

    const groupedByRow = rows.map(row => {
      const colorGroups: Record<string, Serie[]> = {};

      for (const item of row.data) {
        const color = this.getColorKey(item.y);
        if (!colorGroups[color]) {
          colorGroups[color] = [];
        }
        colorGroups[color].push(item);
      }

      return {
        name: row.name,
        colorGroups,
      };
    });

    const colorList = fixedColorRange.map(r => r.color);
    const maxByColor: Record<string, number> = {};

    for (const color of colorList) {
      maxByColor[color] = Math.max(
        ...groupedByRow.map(row => row.colorGroups[color]?.length || 0)
      );
    }

    const finalRows = groupedByRow.map(row => {
      const newData: Serie[] = [];

      for (const color of colorList) {
        const items = row.colorGroups[color] ?? [];
        const missing = maxByColor[color] - items.length;

        const fillers = Array(missing)
          .fill(null)
          .map(() => ({
            x: '',
            y: -1,
            z: '',
          }));

        newData.push(...items, ...fillers);
      }
      return {
        name: row.name,
        data: newData,
      };
    });
    return finalRows;
  }
}
