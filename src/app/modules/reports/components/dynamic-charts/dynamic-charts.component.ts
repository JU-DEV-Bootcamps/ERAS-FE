import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';

import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatDialog } from '@angular/material/dialog';

import { HeatMapService } from '@core/services/api/heat-map.service';
import { ReportService } from '@core/services/api/report.service';

import { customTooltip } from '@core/utils/apex-chart/customTooltip';
import { GetChartOptions } from '@core/utils/apex-chart/heat-map-config';
import { PdfHelper } from '@core/utils/reports/exportReport.util';

import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { Filter } from '../poll-filters/types/filters';
import { PollCountQuestion, PollCountReport } from '@core/models/summary.model';

import { DynamicColumnChartComponent } from './dynamic-column-chart/dynamic-column-chart.component';
import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';
import { PollFiltersComponent } from '../poll-filters/poll-filters.component';
import { ExpandableCardComponent } from '@shared/components/expandable-card-v2/expandable-card.component';
import { ApexTooltipDirective } from '@shared/components/apex-tooltip/apex-tooltip.directive';
import { RISK_COLORS } from '@core/constants/riskLevel';
import {
  DetailsPanelData,
  DetailsPanelComponent,
} from '@shared/components/panels/details-panel-v2/details-panel.component';
import { debounceTime, fromEvent } from 'rxjs';

@Component({
  selector: 'app-dynamic-charts',
  imports: [
    DynamicColumnChartComponent,
    EmptyDataComponent,
    MatIcon,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
    NgApexchartsModule,
    PollFiltersComponent,
    ExpandableCardComponent,
    ApexTooltipDirective,
    DetailsPanelComponent,
  ],
  templateUrl: './dynamic-charts.component.html',
  styleUrl: './dynamic-charts.component.scss',
})
export class DynamicChartsComponent implements AfterViewInit {
  private readonly dialog = inject(MatDialog);

  title = '';
  uuid: string | null = null;
  cohorTitle: string | null = null;
  chartsOptions: ApexOptions[] = [];
  evaluationId?: number | string;
  pdfHelper = inject(PdfHelper);
  heatmapService = inject(HeatMapService);
  reportService = inject(ReportService);

  isGeneratingPDF = false;
  isLoading = false;
  components = signal<PollCountReport | null>(null);
  heatmapChart = true;
  cohortIds = '';
  expandedId: string | null = null;

  selectedPanelData = signal<DetailsPanelData | null>(null);
  isPanelOpen = signal(false);
  isAnyCardExpanded = false;
  gridHeight = 0;

  @ViewChild('contentToExport', { static: false }) contentToExport!: ElementRef;

  private cardWidth = signal<number>(0);

  ngAfterViewInit() {
    const DEFAULT_DEBOUNCE_TIME = 450;
    this._updateCardWidth();

    fromEvent(window, 'resize')
      .pipe(debounceTime(DEFAULT_DEBOUNCE_TIME))
      .subscribe(() => {
        this._updateCardWidth();
        const report = this.components();
        if (report) this.generateSeries(report);
      });
  }

  constructor(
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  generateHeatMap(cohortIds: number[], variablesIds: number[]) {
    if (this.uuid === null) return;

    this.isLoading = true;
    this.reportService
      .getCountPoolReport(this.uuid, cohortIds, variablesIds, this.evaluationId)
      .subscribe(data => {
        if (data) {
          this.components.set(data.body);
          this.generateSeries(data.body);
          this.isGeneratingPDF = false;
          this.isLoading = false;
        } else {
          this.chartsOptions = [];
          this.components.set(null);
        }
      });
  }

  generateSeries(report: PollCountReport) {
    const totalWidth = this.cardWidth();
    const isAnyExpanded = this.expandedId !== null;
    const CARD_LAYOUT = {
      spacing: 16,
      columns: 2,
      fallbackWidth: 400,
    };

    const cardWidth =
      totalWidth > 0
        ? isAnyExpanded
          ? totalWidth - CARD_LAYOUT.spacing
          : totalWidth / CARD_LAYOUT.columns - CARD_LAYOUT.spacing
        : CARD_LAYOUT.fallbackWidth;

    this.chartsOptions = [];
    const hmSeries = report.components.map(c =>
      this.reportService.getHMSeriesFromCountComponent(c)
    );
    this.chartsOptions = hmSeries.map((series, index) => {
      const regroupSeries = this.reportService.regroupDynamicByColor(series);
      const component = report.components[index];
      return GetChartOptions(
        `Reporte: ${component.description}`,
        regroupSeries,
        (x: number, y: number) => {
          const questionIndex = y;
          const answerIndex = x;

          const groupedQuestion = series[questionIndex];
          const question = component.questions[questionIndex];

          if (question && groupedQuestion) {
            const dataAtPoint = regroupSeries[questionIndex]?.data[
              answerIndex
            ] as unknown as { z: string; totalFillers?: number };
            const totalFillers = dataAtPoint?.totalFillers ?? 0;
            const realAnswerIndex = answerIndex - totalFillers;

            const selectedAnswer = groupedQuestion.data[realAnswerIndex];

            if (selectedAnswer) {
              const selectedQuestionOnly: PollCountQuestion = {
                ...question,
                answers: question.answers,
              };

              this.openDetailsModal(
                this.uuid!,
                this.cohortIds,
                selectedQuestionOnly,
                component.description,
                component.text,
                selectedAnswer.y as number
              );
            }
          }
        },
        undefined,
        (x: number, y: number) => {
          const groupedQuestion = series[x];
          const dataAtPoint = regroupSeries[x]?.data[y] as unknown as {
            z: string;
            count?: number;
            totalFillers?: number;
          };
          const totalFillers = dataAtPoint?.totalFillers ?? 0;
          const groupedAnswer = groupedQuestion?.data[y - totalFillers] as {
            count?: number;
            x: number;
          };
          const color = RISK_COLORS[regroupSeries[x]?.data[y].x];
          return customTooltip(
            `${groupedAnswer?.count ?? 0}`,
            dataAtPoint.z,
            color
          );
        },
        cardWidth
      );
    });
    this.cdr.detectChanges();
  }

  async exportReportPdf() {
    if (this.isGeneratingPDF) return;

    this.isGeneratingPDF = true;
    await this.pdfHelper.exportToPdf({
      fileName: 'report_detail',
      container: this.contentToExport,
      snackBar: this.snackBar,
    });
    this.isGeneratingPDF = false;
  }

  handleFilterSelect(filters: Filter) {
    this.title = filters.title;
    this.uuid = filters.uuid;
    this.cohortIds = filters.cohortIds.join(',');
    this.evaluationId = filters.evaluationId;
    if (!filters.cohortIds || filters.variableIds.length === 0) {
      this.chartsOptions = [];
      this.components.set(null);
      this.uuid = null;
      return;
    }
    this.generateHeatMap(filters.cohortIds, filters.variableIds);
  }

  onToggle(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
    this.isAnyCardExpanded = this.expandedId !== null;
    if (this.expandedId === null) {
      this.gridHeight = this.contentToExport.nativeElement.offsetHeight;
    }
    this._updateCardWidth();
    const report = this.components();
    if (report) this.generateSeries(report);
  }

  openDetailsModal(
    pollUuid: string,
    cohortId: string,
    question: PollCountQuestion,
    componentName: ComponentValueType,
    text?: string,
    riskLevel?: number
  ): void {
    this.selectedPanelData.set({
      cohortId,
      pollUuid,
      componentName,
      text,
      question,
      riskLevel,
      evaluationId: this.evaluationId,
    });
    this.isPanelOpen.set(true);

    setTimeout(() => {
      this._updateCardWidth();
      const report = this.components();
      if (report) this.generateSeries(report);
    }, 50);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.selectedPanelData.set(null);

    setTimeout(() => {
      this._updateCardWidth();
      const report = this.components();
      if (report) this.generateSeries(report);
    }, 50);
  }

  toggleChart(chart: string) {
    this.heatmapChart = chart === 'heatmap';
  }

  get showEmpty(): boolean {
    return !this.uuid;
  }

  getTooltipFn(chartIndex: number): (x: number, y: number) => string {
    return (seriesIndex: number, dataPointIndex: number) => {
      const report = this.components();
      if (!report) return '';

      const component = report.components[chartIndex];
      const series =
        this.reportService.getHMSeriesFromCountComponent(component);
      const regroupSeries = this.reportService.regroupDynamicByColor(series);

      const groupedQuestion = series[seriesIndex];
      const dataAtPoint = regroupSeries[seriesIndex]?.data[dataPointIndex];

      const totalFillers = dataAtPoint?.totalFillers ?? 0;
      const groupedAnswer =
        groupedQuestion?.data[dataPointIndex - totalFillers];

      const color = RISK_COLORS[dataPointIndex];

      return customTooltip(
        `${groupedAnswer?.count ?? 0}`,
        dataAtPoint?.z ?? '',
        color
      );
    };
  }

  onCardExpand(expanded: boolean) {
    this.isAnyCardExpanded = expanded;
  }

  private _updateCardWidth() {
    const width = this.contentToExport?.nativeElement?.offsetWidth ?? 0;
    this.cardWidth.set(width);
  }
}
