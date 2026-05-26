import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  AfterViewInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { debounceTime, fromEvent } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HeatMapService } from '@core/services/api/heat-map.service';
import { ReportService } from '@core/services/api/report.service';
import { customTooltip } from '@core/utils/apex-chart/customTooltip-v2';
import { GetChartOptions } from '@core/utils/apex-chart/heat-map-config-v2';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { PollCountQuestion, PollCountReport } from '@core/models/summary.model';
import { RISK_COLORS } from '@core/constants/riskLevel';

import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';
import { ExpandableCardComponent } from '@shared/components/expandable-card-v2/expandable-card.component';
import { ApexTooltipDirective } from '@shared/components/apex-tooltip/apex-tooltip.directive';
import {
  DetailsPanelData,
  DetailsPanelComponent,
} from '@shared/components/panels/details-panel-v2/details-panel.component';
import { PollFiltersComponent } from '../poll-filters/poll-filters.component';
import { Filter } from '../poll-filters/types/filters';
import { DynamicColumnChartV2Component } from './dynamic-column-chart-v2/dynamic-column-chart-v2.component';

@Component({
  selector: 'app-dynamic-charts--v2',
  imports: [
    EmptyDataComponent,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
    NgApexchartsModule,
    PollFiltersComponent,
    ExpandableCardComponent,
    ApexTooltipDirective,
    DetailsPanelComponent,
    MatProgressSpinner,
    DynamicColumnChartV2Component,
  ],
  templateUrl: './dynamic-charts-v2.component.html',
  styleUrl: './dynamic-charts-v2.component.scss',
})
export class DynamicChartsV2Component implements AfterViewInit {
  title = '';
  uuid: string | null = null;
  cohorTitle: string | null = null;
  chartsOptions: ApexOptions[] = [];
  evaluationId?: number | string;
  componentsSelected: string[] = [];
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
  hasNoResults = false;
  isAnyCardExpanded = false;
  expandedComponent: string | null | undefined = null;

  gridHeight = 0;
  isExporting = signal(false);
  chartTypeMap = new Map<string, 'heatmap' | 'column'>();
  resizeTick = signal(0);
  isPanelTransitioning = signal(false);

  @ViewChild('contentQuarter', { static: false }) contentQuarter!: ElementRef;
  @ViewChildren('chartsGrid') chartsGrid!: QueryList<ExpandableCardComponent>;

  private cardWidth = signal<number>(0);

  ngAfterViewInit() {
    const DEFAULT_DEBOUNCE_TIME = 450;
    this._updateCardWidth();

    fromEvent(window, 'resize')
      .pipe(debounceTime(DEFAULT_DEBOUNCE_TIME))
      .subscribe(() => {
        this.refreshSeries();
      });
  }

  constructor(private cdr: ChangeDetectorRef) {}

  generateHeatMap(cohortIds: number[], variablesIds: number[]) {
    if (this.uuid === null) return;
    this.isLoading = true;
    this.reportService
      .getCountPoolReport(this.uuid, cohortIds, variablesIds, this.evaluationId)
      .subscribe(data => {
        if (data) {
          this.components.set(data.body);
          this.hasNoResults = data.body.components.length === 0;
          this.isGeneratingPDF = false;
          this.isLoading = false;
          requestAnimationFrame(() => {
            this._updateCardWidth();
            this.generateSeries(data.body);
          });
        } else {
          this.chartsOptions = [];
          this.components.set(null);
          this.hasNoResults = true;
          this.isAnyCardExpanded = false;
          this.isLoading = false;
        }
      });
  }

  generateSeries(report: PollCountReport) {
    const totalWidth = this.cardWidth();
    const CARD_LAYOUT = {
      spacing: 16,
      columns: 2,
      fallbackWidth: 400,
    };

    const cardWidth =
      totalWidth > 0
        ? this.isAnyCardExpanded
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
          const question = component.questions[x];

          return customTooltip(
            question?.question ?? '',
            `${groupedAnswer?.count ?? 0}`,
            dataAtPoint.z,
            color
          );
        },
        cardWidth,
        this.isAnyCardExpanded
      );
    });
    this.cdr.detectChanges();
  }

  handleFilterSelect(filters: Filter) {
    this.resetBaseState();
    this.applyFilterMetadata(filters);
    if (!this.isValidFilter(filters)) {
      this.resetState();
      return;
    }
    this.handleExpandedState(filters);
    this.gridHeight = 0;
    this.generateHeatMap(filters.cohortIds, filters.variableIds);
  }

  onToggle(id: string): void {
    this.expandedComponent = id.replace('chart-', '');
    this.expandedId = this.expandedId === id ? null : id;
    this.isAnyCardExpanded = this.expandedId !== null;
    if (this.expandedId === null) {
      this.gridHeight = this.contentQuarter.nativeElement.offsetHeight;
    }
    this._updateCardWidth();
    this.refreshSeries(50);
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
    this.isPanelTransitioning.set(true);
    this.isPanelOpen.set(true);

    setTimeout(() => {
      this._updateCardWidth();
      this.refreshSeries(50);
      this.resizeTick.update(v => v + 1);
    }, 50);
  }

  closePanel(): void {
    this.isPanelTransitioning.set(true);
    this.isPanelOpen.set(false);
    this.selectedPanelData.set(null);

    setTimeout(() => {
      this._updateCardWidth();
      this.refreshSeries(50);
      this.resizeTick.update(v => v + 1);
    }, 50);
  }

  toggleChart(chart: string) {
    this.heatmapChart = chart === 'heatmap';
  }

  async onExporting(processExport: boolean) {
    if (processExport) {
      this.isExporting.set(true);
    } else {
      this.isExporting.set(false);
    }
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
      const question = component.questions[seriesIndex];

      return customTooltip(
        question?.question ?? '',
        `${groupedAnswer?.count ?? 0}`,
        dataAtPoint?.z ?? '',
        color
      );
    };
  }

  private _updateCardWidth() {
    const width = this.contentQuarter?.nativeElement?.offsetWidth ?? 0;
    this.cardWidth.set(width);
  }

  private refreshSeries(delay = 0): void {
    setTimeout(() => {
      this._updateCardWidth();
      const report = this.components();
      if (report) this.generateSeries(report);
    }, delay);
  }

  getChartType(index: number): 'heatmap' | 'column' {
    const componentLabel = this.componentsSelected[index];
    return this.chartTypeMap.get(componentLabel) ?? 'heatmap';
  }

  onChartTypeChange(index: number, type: 'heatmap' | 'column'): void {
    const componentLabel = this.componentsSelected[index];
    this.chartTypeMap.set(componentLabel, type);
  }

  getComponentOfChart(titleChart: string | undefined) {
    return titleChart?.replace('Reporte: ', '').toLocaleLowerCase();
  }

  private resetBaseState() {
    this.hasNoResults = false;
  }

  private applyFilterMetadata(filters: Filter) {
    this.title = filters.title;
    this.uuid = filters.uuid;
    this.cohortIds = filters.cohortIds.join(',');
    this.evaluationId = filters.evaluationId;
    this.componentsSelected = filters.selectedComponents;
  }

  private isValidFilter(filters: Filter): boolean {
    return !!filters.cohortIds && filters.variableIds.length > 0;
  }

  private resetState() {
    this.chartsOptions = [];
    this.components.set(null);
    this.uuid = null;
    this.isAnyCardExpanded = false;
    this.expandedId = null;
  }

  private handleExpandedState(filters: Filter) {
    if (!this.isAnyCardExpanded) return;

    const selected = filters.selectedComponents;
    const expanded = this.expandedComponent?.toLowerCase();

    let index = selected.findIndex(c => c === expanded);
    if (selected.length > 1 && index === -1) {
      this.isAnyCardExpanded = false;
      return;
    }
    if (index === -1) {
      index = 0;
      this.expandedComponent = selected[0].toLowerCase();
    }
    this.expandedId = `chart-${this.expandedComponent}`;
  }
}
