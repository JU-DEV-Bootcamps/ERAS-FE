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

import { ComponentValueType } from 'src/app/features/heat-map/types/risk-students-detail.type';
import {
  PollCountAnswer,
  PollCountComponent,
  PollCountQuestion,
  PollCountReport,
} from '@core/models/summary.model';
import { RISK_COLORS, RISK_LABELS } from '@core/constants/riskLevel';

import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from 'src/app/features/heat-map/modal-question-details/modal-question-details.component';
import { TooltipChartComponent } from '../tooltip-chart/tooltip-chart.component';

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
  selector: 'app-column-charts',
  imports: [NgApexchartsModule],
  templateUrl: './column-charts.component.html',
})
export class ColumnChartsComponent {
  components = input<PollCountReport>();
  identifier = input<string>();

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
        xIndex => {
          this._openDetailsModal(
            this.identifier()!,
            1,
            components[index].questions[xIndex],
            components[index].description,
            components[index].text
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
      title: {
        text: title,
        margin: 0,
        offsetY: 0,
      },
      chart: this._createChartBase(onSelect),
      series: this._createSeries(questions),
      plotOptions: { bar: { horizontal: false } },
      xaxis: this._createXAxis(questions),
      fill: { opacity: 0.8 },
      legend: this._createLegend(),
      tooltip: this._createTooltip(),
      responsive: this._createResponsive(),
    };
  }

  private _createChartBase(
    onSelect?: (x: number, y: number) => void
  ): ApexChart {
    return {
      type: 'bar',
      height: 650,
      stacked: true,
      stackType: '100%',
      toolbar: { show: false },
      zoom: { enabled: false },
      events: {
        dataPointSelection: (_event, _ctx, cfg) => {
          if (onSelect) onSelect(cfg.dataPointIndex, cfg.seriesIndex);
        },
      },
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

  private _createXAxis(questions: PollCountQuestion[]): ApexXAxis {
    return {
      categories: questions.map(q => q.question),
      labels: {
        trim: true,
        hideOverlappingLabels: false,
        maxHeight: 100,
      },
    };
  }

  private _createLegend(): ApexLegend {
    return {
      position: 'top',
      horizontalAlign: 'left',
      height: 50,
      onItemClick: { toggleDataSeries: true },
    };
  }

  private _createTooltip(): ApexTooltip {
    return {
      followCursor: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const value = series[seriesIndex][dataPointIndex];
        const category = w.globals.labels[dataPointIndex];
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

  private _createResponsive() {
    return [
      {
        breakpoint: 1000,
        options: {
          plotOptions: { bar: { horizontal: true } },
          categories: [],
          yaxis: {
            labels: {
              show: true,
              formatter: function (val: string) {
                const maxLength = 4;
                return val.length > maxLength
                  ? val.substring(0, maxLength) + '…'
                  : val;
              },
              style: {
                fontSize: 10,
              },
            },
          },
          xaxis: {
            labels: {
              show: true,
              style: {
                fontSize: 10,
              },
            },
          },
          legend: {
            horizontalAlign: 'center',
            fontSize: 10,
          },
        },
      },
    ];
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
    cohortId: number,
    question: PollCountQuestion,
    componentName: ComponentValueType,
    text?: string
  ) {
    const data: SelectedHMData = {
      cohortId: cohortId.toString(),
      pollUuid,
      componentName,
      text,
      question,
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
