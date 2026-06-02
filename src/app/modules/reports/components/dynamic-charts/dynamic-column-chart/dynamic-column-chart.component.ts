import {
  Component,
  computed,
  createComponent,
  EnvironmentInjector,
  inject,
  input,
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

import { MatDialog } from '@angular/material/dialog';

import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import {
  PollCountAnswer,
  PollCountComponent,
  PollCountQuestion,
  PollCountReport,
} from '@core/models/summary.model';
import { RISK_COLORS, RISK_LABELS } from '@core/constants/riskLevel';
import { ColumnChartUtils } from '@modules/reports/utils/column-chart.config';

import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from '@shared/components/modals/modal-question-details/modal-question-details.component';
import { TooltipChartComponent } from '../../tooltip-chart/tooltip-chart.component';

export interface ChartOptions {
  chart: ApexChart;
  colors: string[];
  fill: ApexFill;
  foreColor: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  series: ApexAxisChartSeries;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  xaxis: ApexXAxis;
}

@Component({
  selector: 'app-dynamic-column-chart',
  imports: [NgApexchartsModule],
  templateUrl: './dynamic-column-chart.component.html',
})
export class DynamicColumnChartComponent {
  components = input<PollCountReport>();
  identifier = input<string>();
  cohortsIds = input<string>();

  private injector = inject(EnvironmentInjector);
  private dialog = inject(MatDialog);

  chartOptions = computed(() => {
    const data = this.components();
    return data ? this._buildChart(data.components) : [];
  });

  private _buildChart(
    components: PollCountComponent[]
  ): Partial<ChartOptions>[] {
    return components.map((component, index) => {
      return this._createChart(
        `Reporte: ${component.description}`,
        component.questions,
        (xIndex, sIndex) => {
          this._openDetailsModal(
            this.identifier()!,
            this.cohortsIds()!,
            components[index].questions[xIndex],
            components[index].description,
            components[index].text,
            sIndex
          );
        }
      );
    });
  }

  private _createChart(
    title: string,
    questions: PollCountQuestion[],
    onSelect?: (x: number, y: number) => void
  ): Partial<ChartOptions> {
    return {
      title: ColumnChartUtils.createTitle(title),
      chart: ColumnChartUtils.createChartBase((xIndex, sIndex) => {
        if (onSelect) onSelect(xIndex, sIndex);
      }),
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
        const value = `<b>Student Answers:<b> ${series[seriesIndex][dataPointIndex]}`;
        const category = `Q: ${w.globals.labels[dataPointIndex]}`;
        const emails = w.config.series[seriesIndex].data[dataPointIndex].meta;

        const compRef = createComponent(TooltipChartComponent, {
          environmentInjector: this.injector,
        });

        compRef.instance.value = value;
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

  private _getAnswersRisks(questions: PollCountQuestion[], riskLevel: number) {
    return questions.map(question => {
      const filteredAnswers = question.answers.filter(
        answer => Math.trunc(answer.answerRisk) === riskLevel
      );

      const totalCount = filteredAnswers.reduce(
        (sum, ans) => sum + ans.count,
        0
      );
      const emails = this._extractEmails(filteredAnswers);

      return {
        x: '',
        y: totalCount,
        meta: emails,
      };
    });
  }

  private _extractEmails(answers: PollCountAnswer[]): string[] {
    return answers.flatMap(answer => answer.students.map(s => s.email));
  }

  private _openDetailsModal(
    pollUuid: string,
    cohortId: string,
    question: PollCountQuestion,
    componentName: ComponentValueType,
    text?: string,
    riskLevel?: number
  ) {
    const data: SelectedHMData = {
      cohortId: cohortId.toString(),
      pollUuid,
      componentName,
      text,
      question,
      riskLevel,
    };

    this.dialog.open(ModalQuestionDetailsComponent, {
      width: 'clamp(320px, 50vw, 580px)',
      maxWidth: '60vw',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data,
    });
  }
}
