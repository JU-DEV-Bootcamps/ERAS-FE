import {
  Component,
  computed,
  createComponent,
  EnvironmentInjector,
  inject,
  input,
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
import { ErasModalService } from '@shared/components/modals/eras-modal/eras-modal.service';
import { TooltipChartComponent } from '../../tooltip-chart/tooltip-chart.component';
import RiskDetailsComponent from '../risk-details/risk-details.component';

@Component({
  selector: 'app-summary-column-charts',
  imports: [NgApexchartsModule],
  templateUrl: './summary-column-charts.component.html',
})
export class SummaryColumnChartsComponent {
  components = input<PollAvgReport>();
  pollUuid = input<string>();
  cohortsIds = input<number[]>();
  data = input();

  private injector = inject(EnvironmentInjector);
  private erasModalService = inject(ErasModalService);

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
      (x, y, series) => this._showRiskDetails(x, y, series)
    );
  }

  private _showRiskDetails(x: number, y: number, series: ComponentRisk[]) {
    const componentName: string =
      this.components()?.components[x].description || '';
    const modalData = {
      component: RiskDetailsComponent,
      data: {
        riskGroup: series[y].data[x],
        pollUuid: this.pollUuid(),
        cohorts: this.cohortsIds(),
        componentName,
      },
      title: `${componentName}: ${series[y].name} Details`,
    };

    this.erasModalService.openComponent(modalData);
  }

  private _createChart(
    title: string,
    components: PollAvgComponent[],
    onSelect?: (x: number, y: number, series: ComponentRisk[]) => void
  ): Partial<ChartOptions> {
    return {
      title: ColumnChartUtils.createTitle(title),
      chart: ColumnChartUtils.createChartBase(onSelect),
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
