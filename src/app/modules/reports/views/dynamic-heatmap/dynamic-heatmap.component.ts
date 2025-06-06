import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { PollFiltersComponent } from '../../components/poll-filters/poll-filters.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { printReportInfo } from '../../exportReport.util';
import { PdfService } from '../../../../core/services/exports/pdf.service';
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
  title = '';
  uuid: string | null = null;
  cohorTitle: string | null = null;
  chartsOptions: ApexOptions[] = [];
  pdfService = inject(PdfService);
  heatmapService = inject(HeatMapService);
  reportService = inject(ReportService);

  @ViewChild('mainContainer', { static: false }) mainContainer!: ElementRef;

  constructor(private snackBar: MatSnackBar) {}

  generateHeatMap(cohortIds: number[], variablesIds: number[]) {
    if (this.uuid === null) return;
    this.reportService
      .getCountPoolReport(this.uuid, cohortIds, variablesIds)
      .subscribe(data => {
        this.generateSeries(data.body);
        this.isGeneratingPDF = false;
      });
  }

  generateSeries(report: PollCountReport) {
    const hmSeries = report.components.map(c =>
      this.reportService.getHMSeriesFromCountComponent(c)
    );
    this.chartsOptions = hmSeries.map((series, index) =>
      GetChartOptions(
        `Reporte: ${report.components[index].description}`,
        series,
        (_x, y) => {
          this.openDetailsModal(
            this.uuid!,
            1,
            report.components[index].questions[y],
            report.components[index].description
          );
        },
        undefined,
        (x, y) => {
          const component = report.components[index];
          const question = component.questions[x];
          const riskLevel = question.answers[y];
          return `
          <b>${riskLevel.count} students answered with a risk Level of ${riskLevel.answerRisk}</b>
          <b>Componente:</b> ${component.description} </br>
          <b>Question:</b> ${question.question} </br>
          `;
        }
      )
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

  handleFilterSelect(filters: Filter) {
    this.title = filters.title;
    this.uuid = filters.uuid;
    this.generateHeatMap(filters.cohortIds, filters.variableIds);
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
    this.dialog.open(ModalQuestionDetailsComponent, {
      width: 'clamp(320px, 50vw, 580px)',
      maxWidth: '60vw',
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data,
    });
  }
}
