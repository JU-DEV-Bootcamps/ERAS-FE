import {
  Component,
  computed,
  createComponent,
  EnvironmentInjector,
  inject,
  input,
  output,
} from '@angular/core';
import { ApexTooltip, NgApexchartsModule } from 'ng-apexcharts';

import { ChartOptions } from '@modules/reports/models/apexchart.model';
import {
  ComponentRisk,
  PollAvgComponent,
  PollAvgQuestion,
  PollAvgReport,
} from '@core/models/summary.model';
import { RISK_COLORS, RISK_LABELS } from '@core/constants/riskLevel';

import { ColumnChartUtils } from '@modules/reports/utils/column-chart.config';
import { TooltipChartComponent } from '../../tooltip-chart/tooltip-chart.component';
import { ColumnRiskPanelData } from '../column-risk-panel/column-risk-panel.component';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';

@Component({
  selector: 'app-summary-column-charts-v2',
  imports: [NgApexchartsModule],
  templateUrl: './summary-column-charts-v2.component.html',
})
export class SummaryColumnChartsV2Component {
  components = input<PollAvgReport>();
  pollUuid = input<string>();
  cohortsIds = input<number[]>();
  data = input();
  evaluationId = input<number | string>();

  openPanel = output<ColumnRiskPanelData>();

  private injector = inject(EnvironmentInjector);

  chartOptions = computed<Partial<ChartOptions>>(() => {
    const data = this.components();
    return data
      ? this._buildChart(data.components)
      : ({} as Partial<ChartOptions>);
  });

  private _buildChart(components: PollAvgComponent[]): Partial<ChartOptions> {
    return this._createChart(
      this.data() as string,
      components,
      (x, y, series) => this._emitPanelData(x, y, series)
    );
  }

  private _emitPanelData(x: number, y: number, series: ComponentRisk[]) {
    const component = this.components();
    if (!component || !this.pollUuid() || !this.cohortsIds()?.length) return;

    const componentName = component.components[x].description;
    const riskGroup = series[y];
    const questions: PollAvgQuestion[] = riskGroup.data[x].data ?? [];
    if (!questions.length) return;

    const panelData: ColumnRiskPanelData = {
      cohortIds: this.cohortsIds()!,
      pollUuid: this.pollUuid()!,
      componentName: componentName as ComponentValueType,
      title: `${componentName}: ${riskGroup.name} Details`,
      questions,
      evaluationId: this.evaluationId(),
    };

    this.openPanel.emit(panelData);
  }

  private _createChart(
    title: string,
    components: PollAvgComponent[],
    onSelect?: (x: number, y: number, series: ComponentRisk[]) => void
  ): Partial<ChartOptions> {
    return {
      title: ColumnChartUtils.createTitle(title),
      chart: ColumnChartUtils.createChartBase(onSelect, components.length),
      series: this._createSeries(components),
      plotOptions: ColumnChartUtils.createPlotOptions(),
      xaxis: ColumnChartUtils.createXAxis(
        components.map(component => component.description)
      ),
      fill: ColumnChartUtils.createFill(),
      legend: ColumnChartUtils.createLegend(),
      tooltip: this._createTooltip(),
      responsive: ColumnChartUtils.createResponsive(),
    };
  }

  private _createSeries(components: PollAvgComponent[]) {
    return Object.keys(RISK_LABELS)
      .filter(key => key !== 'default')
      .map(key => {
        const index = Number(key);
        return {
          name: RISK_LABELS[index],
          color: RISK_COLORS[index],
          data: this._getAnswersRisks(components, index),
        };
      });
  }

  private _getAnswersRisks(components: PollAvgComponent[], riskLevel: number) {
    return components.map(component => {
      const filteredQuestions = component.questions.filter(
        question => Math.round(question.averageRisk) === riskLevel
      );
      const emails = this._extractEmails(filteredQuestions);

      return {
        x: '',
        y: filteredQuestions.length,
        meta: [...new Set(emails)],
        data: filteredQuestions,
      };
    });
  }

  private _extractEmails(questions: PollAvgQuestion[]): string[] {
    return questions
      .flatMap(question => question.answersDetails.map(s => s.studentsEmails))
      .flat(2);
  }

  private _createTooltip(): ApexTooltip {
    return {
      followCursor: true,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const value =
          w.config.series[seriesIndex].data[dataPointIndex].meta.length;
        const category = w.globals.labels[dataPointIndex];
        const emails = w.config.series[seriesIndex].data[dataPointIndex].meta;

        const compRef = createComponent(TooltipChartComponent, {
          environmentInjector: this.injector,
        });

        compRef.instance.value = `Students: ${value}`;
        compRef.instance.category = category;
        compRef.instance.emails = emails;

        const container = document.createElement('div');
        container.appendChild(compRef.location.nativeElement);
        compRef.changeDetectorRef.detectChanges();

        const html = container.innerHTML;
        compRef.destroy();

        return html;
      },
    };
  }
}
