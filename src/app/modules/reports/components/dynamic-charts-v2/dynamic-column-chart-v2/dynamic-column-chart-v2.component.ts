import {
  Component,
  computed,
  EnvironmentInjector,
  inject,
  input,
  output,
} from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import {
  PollCountAnswer,
  PollCountComponent,
  PollCountQuestion,
} from '@core/models/summary.model';
import {
  RISK_COLORS,
  RISK_LABELS,
  getRiskGroup,
} from '@core/constants/riskLevel';
import { ColumnChartUtils } from '@modules/reports/utils/column-chart.config';

export interface ChartOptions {
  chart?: ApexChart;
  colors?: string[];
  fill?: ApexFill;
  foreColor?: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  series: ApexAxisChartSeries;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  xaxis: ApexXAxis;
}

export interface SelectPointEvent {
  question: PollCountQuestion;
  componentName: ComponentValueType;
  text?: string;
  riskLevel: number;
}

@Component({
  selector: 'app-dynamic-column-chart-v2',
  imports: [NgApexchartsModule],
  templateUrl: './dynamic-column-chart-v2.component.html',
})
export class DynamicColumnChartV2Component {
  componentData = input<PollCountComponent>();
  identifier = input<string>();
  cohortsIds = input<string>();
  evaluationId = input<number | string | undefined>();
  tooltipFn = input<(seriesIndex: number, dataPointIndex: number) => string>();
  resizeTrigger = input<number>(0);

  selectPoint = output<SelectPointEvent>();
  private injector = inject(EnvironmentInjector);

  chartOption = computed((): Partial<ChartOptions> | null => {
    const data = this.componentData();
    const trigger = this.resizeTrigger();
    void trigger;
    return data ? this._buildChart(data) : null;
  });

  private _buildChart(component: PollCountComponent): Partial<ChartOptions> {
    return this._createChart(
      `Reporte: ${component.description}`,
      component.questions,
      (xIndex, sIndex) => {
        this.selectPoint.emit({
          question: component.questions[xIndex],
          componentName: component.description as ComponentValueType,
          text: component.text,
          riskLevel: sIndex,
        });
      }
    );
  }

  private _createChart(
    title: string,
    questions: PollCountQuestion[],
    onSelect?: (x: number, y: number) => void
  ): Partial<ChartOptions> {
    return {
      title: ColumnChartUtils.createTitle(title),
      chart: ColumnChartUtils.createChartBase((x, s) => onSelect?.(x, s)),
      series: this._createSeries(questions),
      plotOptions: ColumnChartUtils.createPlotOptions(),
      xaxis: ColumnChartUtils.createXAxis(questions.map(q => q.question)),
      fill: ColumnChartUtils.createFill(),
      legend: ColumnChartUtils.createLegend(),
      tooltip: this._createTooltip(),
      responsive: ColumnChartUtils.createResponsive(),
    };
  }

  private _createSeries(questions: PollCountQuestion[]) {
    return Object.keys(RISK_LABELS)
      .filter(key => key !== 'default')
      .map(key => {
        const index = Number(key);
        return {
          name: RISK_LABELS[index],
          color: RISK_COLORS[index],
          data: this._getAnswersRisks(questions, index),
        };
      });
  }

  private _createTooltip(): ApexTooltip {
    return {
      followCursor: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        void series;
        void w;
        const fn = this.tooltipFn();
        return fn ? fn(dataPointIndex, seriesIndex) : '';
      },
    };
  }

  private _getAnswersRisks(questions: PollCountQuestion[], riskLevel: number) {
    return questions.map(question => {
      const filteredAnswers = question.answers.filter(
        answer => getRiskGroup(answer.answerRisk) === riskLevel
      );
      const totalCount = filteredAnswers.reduce(
        (sum, ans) => sum + ans.count,
        0
      );
      const emails = this._extractEmails(filteredAnswers);
      return { x: '', y: totalCount, meta: emails };
    });
  }

  private _extractEmails(answers: PollCountAnswer[]): string[] {
    return answers.flatMap(answer => answer.students.map(s => s.email));
  }
}
