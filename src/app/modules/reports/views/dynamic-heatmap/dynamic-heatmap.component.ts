import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { PollFiltersComponent } from '../../components/poll-filters/poll-filters.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { printReportInfo } from '../../exportReport.util';
import { PdfService } from '../../../../core/services/exports/pdf.service';
import { EmptyDataComponent } from '../../../../shared/components/empty-data/empty-data.component';
import { HeatMapService } from '../../../../core/services/api/heat-map.service';
import { ChartOptionsColorsCount } from '../../../../features/reports/constants/heat-map';
import { MatIcon } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
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

@Component({
  selector: 'app-dynamic-heatmap',
  imports: [
    PollFiltersComponent,
    EmptyDataComponent,
    MatIcon,
    NgApexchartsModule,
  ],
  templateUrl: './dynamic-heatmap.component.html',
  styleUrl: './dynamic-heatmap.component.css',
})
export class DynamicHeatmapComponent {
  public isGeneratingPDF = true;
  private readonly dialog = inject(MatDialog);
  uuid: string | null = null;
  cohortId: number | null = null;
  chartOption = { ...ChartOptionsColorsCount };
  pdfService = inject(PdfService);
  heatmapService = inject(HeatMapService);
  reportService = inject(ReportService);

  @ViewChild('mainContainer', { static: false }) mainContainer!: ElementRef;

  constructor(private snackBar: MatSnackBar) {}

  generateHeatMap(variablesIds: number[]) {
    if (this.uuid === null || this.cohortId === null) return;
    this.reportService
      .getCountPoolReport(this.uuid, this.cohortId, variablesIds)
      .subscribe(data => {
        this.generateSeries(data.body);
        this.isGeneratingPDF = false;
      });
  }

  generateSeries(report: PollCountReport) {
    const hmSeries = this.reportService.getHMSeriesFromCountComponent(
      report.components[0]
    );
    this.chartOption = GetChartOptions(
      `Answer count, each column is a risk and each cell shows the count of answers: ${report.components[0].description}`,
      hmSeries,
      (x, y) => {
        this.snackBar.open(`x=${x}; y=${y}.`, 'OK', {
          duration: 3000,
          panelClass: ['custom-snackbar'],
        });
        this.openDetailsModal(
          this.uuid!,
          this.cohortId!,
          report.components[0].questions[y],
          report.components[0].description
        );
      }
    );
  }

  exportReportPdf() {
    if (this.isGeneratingPDF) return;
    this.isGeneratingPDF = true;
    const snackBarRef = this.snackBar.open('Generating PDF...', 'Close', {
      duration: 10000,
      panelClass: ['custom-snackbar'],
    });

    setTimeout(() => {
      const clonedElement = printReportInfo(this.mainContainer);
      document.body.appendChild(clonedElement);

      this.pdfService.exportToPDF(clonedElement, `report-detail.pdf`);

      setTimeout(() => {
        snackBarRef.dismiss();

        this.snackBar.open('PDF generated successfully', 'OK', {
          duration: 3000,
          panelClass: ['custom-snackbar'],
        });
        this.isGeneratingPDF = false;
        document.body.removeChild(clonedElement);
      }, 2000);
    }, 10000);
  }

  handleFilterSelect(filters: {
    uuid: string;
    cohortId: number;
    variableIds: number[];
  }) {
    console.info('filters received', filters);
    this.uuid = filters.uuid;
    this.cohortId = filters.cohortId;
    this.generateHeatMap(filters.variableIds);
  }

  openDetailsModal(
    pollUuid: string,
    cohortId: number,
    question: PollCountQuestion,
    componentName: string
  ): void {
    const data: SelectedHMData = {
      cohortId: cohortId.toString(),
      pollUuid,
      componentName,
      question,
    };
    this.dialog.open(ModalQuestionDetailsComponent, { data });
  }
}
