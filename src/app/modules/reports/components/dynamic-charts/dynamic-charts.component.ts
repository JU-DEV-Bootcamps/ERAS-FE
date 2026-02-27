import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
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
import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from '@shared/components/modals/modal-question-details/modal-question-details.component';
import { PollFiltersComponent } from '../poll-filters/poll-filters.component';

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
  ],
  templateUrl: './dynamic-charts.component.html',
  styleUrl: './dynamic-charts.component.scss',
})
export class DynamicChartsComponent {
  private readonly dialog = inject(MatDialog);

  title = '';
  uuid: string | null = null;
  cohorTitle: string | null = null;
  chartsOptions: ApexOptions[] = [];
  pdfHelper = inject(PdfHelper);
  heatmapService = inject(HeatMapService);
  reportService = inject(ReportService);

  isGeneratingPDF = false;
  isLoading = false;
  components = signal<PollCountReport | null>(null);
  heatmapChart = true;
  cohortIds = '';

  @ViewChild('contentToExport', { static: false }) contentToExport!: ElementRef;

  constructor(
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  generateHeatMap(cohortIds: number[], variablesIds: number[]) {
    if (this.uuid === null) return;

    this.isLoading = true;
    this.reportService
      .getCountPoolReport(this.uuid, cohortIds, variablesIds)
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

          const question = component.questions[questionIndex];

          if (question) {
            const dataAtPoint = regroupSeries[questionIndex]?.data[
              answerIndex
            ] as unknown as { z: string; totalFillers?: number };
            const totalFillers = dataAtPoint?.totalFillers ?? 0;
            const realAnswerIndex = answerIndex - totalFillers;

            const selectedAnswer = question.answers[realAnswerIndex];

            if (selectedAnswer) {
              const selectedQuestionOnly: PollCountQuestion = {
                ...question,
                answers: [selectedAnswer],
              };

              this.openDetailsModal(
                this.uuid!,
                this.cohortIds,
                selectedQuestionOnly,
                component.description,
                component.text,
                selectedAnswer.answerRisk
              );
            }
          }
        },
        undefined,
        (x: number, y: number) => {
          const question = component.questions[x];
          const dataAtPoint = regroupSeries[x]?.data[y] as unknown as {
            z: string;
            totalFillers?: number;
          };
          const totalFillers = dataAtPoint?.totalFillers ?? 0;
          const riskLevel = question.answers[y - totalFillers];

          return customTooltip(
            question.question,
            `${riskLevel.count}`,
            dataAtPoint.z
          );
        }
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
    if (!filters.cohortIds || !filters.variableIds) {
      this.chartsOptions = [];
      this.components.set(null);
      return;
    }
    this.generateHeatMap(filters.cohortIds, filters.variableIds);
  }

  openDetailsModal(
    pollUuid: string,
    cohortId: string,
    question: PollCountQuestion,
    componentName: ComponentValueType,
    text?: string,
    riskLevel?: number
  ): void {
    const data: SelectedHMData = {
      cohortId: cohortId,
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

  toggleChart(chart: string) {
    this.heatmapChart = chart === 'heatmap';
  }
}
