import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { PollFiltersComponent } from '../../components/poll-filters/poll-filters.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PdfHelper } from '../../exportReport.util';
import { EmptyDataComponent } from '../../../../shared/components/empty-data/empty-data.component';
import { HeatMapService } from '../../../../core/services/api/heat-map.service';
import { MatIcon } from '@angular/material/icon';
import { ReportService } from '../../../../core/services/api/report.service';
import { GetChartOptions } from '../../../../features/cohort/util/heat-map-config';
import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from '../../../../features/heat-map/modal-question-details/modal-question-details.component';
import { MatDialog } from '@angular/material/dialog';
import {
  PollCountQuestion,
  PollCountReport,
} from '../../../../core/models/summary.model';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Filter } from '../../components/poll-filters/types/filters';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentValueType } from '../../../../features/heat-map/types/risk-students-detail.type';

@Component({
  selector: 'app-dynamic-heatmap',
  imports: [
    PollFiltersComponent,
    EmptyDataComponent,
    MatIcon,
    MatTooltipModule,
    MatProgressBarModule,
    NgApexchartsModule,
  ],
  templateUrl: './dynamic-heatmap.component.html',
  styleUrl: './dynamic-heatmap.component.css',
})
export class DynamicHeatmapComponent {
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

  @ViewChild('contentToExport', { static: false }) contentToExport!: ElementRef;

  constructor(
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  generateHeatMap(
    cohortIds: number[],
    variablesIds: number[],
    lastVersion: boolean
  ) {
    if (this.uuid === null) return;

    this.isLoading = true;
    this.reportService
      .getCountPoolReport(this.uuid, cohortIds, variablesIds, lastVersion)
      .subscribe(data => {
        this.generateSeries(data.body);
        this.isGeneratingPDF = false;
        this.isLoading = false;
      });
  }

  generateSeries(report: PollCountReport) {
    this.chartsOptions = [];
    const hmSeries = report.components.map(c =>
      this.reportService.getHMSeriesFromCountComponent(c)
    );
    this.chartsOptions = hmSeries.map((series, index) => {
      const regroupSeries = this.reportService.regroupDynamicByColor(series);

      return GetChartOptions(
        `Reporte: ${report.components[index].description}`,
        regroupSeries,
        (_x, y) => {
          this.openDetailsModal(
            this.uuid!,
            1,
            report.components[index].questions[y],
            report.components[index].description,
            report.components[index].text
          );
        },
        undefined,
        (x, y) => {
          const component = report.components[index];
          const question = component.questions[x];
          const totalFillers = regroupSeries[x].data[y].totalFillers || 0;
          const riskLevel = question.answers[y - totalFillers];

          return `
          <b>${riskLevel.count} students answered with a risk Level of ${riskLevel.answerRisk}</b>
          <b>Componente:</b> ${component.description} </br>
          <b>Question:</b> ${question.question} </br>
          `;
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
    this.generateHeatMap(
      filters.cohortIds,
      filters.variableIds,
      filters.lastVersion
    );
  }

  openDetailsModal(
    pollUuid: string,
    cohortId: number,
    question: PollCountQuestion,
    componentName: ComponentValueType,
    text?: string
  ): void {
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
