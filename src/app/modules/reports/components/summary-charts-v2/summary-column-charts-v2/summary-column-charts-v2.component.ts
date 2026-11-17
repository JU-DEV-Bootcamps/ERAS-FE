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
import { ViewportService } from '@core/services/layout/viewport.service';
import { ColumnRiskPanelData } from '../column-risk-panel/column-risk-panel.component';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { TooltipChartV2Component } from '../../tooltip-chart-v2/tooltip-chart-v2.component';
import { ApexTooltipDirective } from '@shared/components/apex-tooltip/apex-tooltip.directive';

@Component({
  selector: 'app-summary-column-charts-v2',
  imports: [NgApexchartsModule, ApexTooltipDirective],
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
  private readonly viewport = inject(ViewportService);
  readonly isMobile = this.viewport.isMobile;

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
        components.map(component => component.description),
        this.isMobile()
      ),
      fill: ColumnChartUtils.createFill(),
      legend: ColumnChartUtils.createLegend(),
      tooltip: this._createTooltip(),
      responsive: this.viewport.renderAsDesktop()
        ? []
        : ColumnChartUtils.createResponsive(),
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
        const meta: string[] =
          w.config.series[seriesIndex].data[dataPointIndex].meta;
        return this._tooltipHtml(w.globals.labels[dataPointIndex], meta);
      },
    };
  }

  tooltipFn = (componentIndex: number, riskIndex: number): string => {
    const component = this.components()?.components[componentIndex];
    const point = this.chartOptions().series?.[riskIndex]?.data[
      componentIndex
    ] as { meta?: string[] } | undefined;
    if (!component || !point) return '';
    return this._tooltipHtml(component.description, point.meta ?? []);
  };

  private _tooltipHtml(category: string, emails: string[]): string {
    const compRef = createComponent(TooltipChartV2Component, {
      environmentInjector: this.injector,
    });

    compRef.instance.value = `Students: ${emails.length}`;
    compRef.instance.category = category;
    compRef.instance.emails = emails;

    const container = document.createElement('div');
    container.appendChild(compRef.location.nativeElement);
    compRef.changeDetectorRef.detectChanges();

    const html = container.innerHTML;
    compRef.destroy();

    return html;
  }
}
