import { CommonModule, DecimalPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';

import { CohortModel } from '@core/models/cohort.model';
import { Column } from '@shared/components/list/types/column';
import { ComponentValueType } from '../../../../features/heat-map/types/risk-students-detail.type';
import { EventLoad } from '@shared/events/load';
import { Filter } from '../../components/poll-filters/types/filters';
import { GetChartOptions } from '@core/utilities/apex-chart/heat-map-config';
import { MatDialog } from '@angular/material/dialog';
import { PollAvgQuestion, PollAvgReport } from '@core/models/summary.model';
import { StudentRiskAverage } from '@core/services/interfaces/student.interface';
import { SummarySerie } from '@core/models/heatmap-data.model';

import { PdfHelper } from '../../exportReport.util';
import { ReportService } from '@core/services/api/report.service';
import { StudentService } from '@core/services/api/student.service';

import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';
import { ListComponent } from '@shared/components/list/list.component';
import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from '../../../../features/heat-map/modal-question-details/modal-question-details.component';
import { PollFiltersComponent } from '../../components/poll-filters/poll-filters.component';
import { SummaryColumnChartsComponent } from '@modules/reports/components/summary-column-charts/summary-column-charts.component';

@Component({
  selector: 'app-students-risk',
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatTableModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgApexchartsModule,
    EmptyDataComponent,
    ListComponent,
    CommonModule,
    PollFiltersComponent,
    MatMenuModule,
    SummaryColumnChartsComponent,
  ],
  templateUrl: './summary-heatmap.component.html',
  styleUrl: './summary-heatmap.component.scss',
})
export class SummaryHeatmapComponent {
  studentService = inject(StudentService);
  pdfHelper = inject(PdfHelper);
  reportService = inject(ReportService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('contentToExport') contentToExport!: ElementRef;

  chartOptions: ApexOptions = {};

  columns: Column<StudentRiskAverage>[] = [
    {
      key: 'studentName',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'avgRiskLevel',
      label: 'Average Risk',
      pipe: new DecimalPipe('en-US'),
      pipeKey: 'avgRiskLevel',
      pipeArgs: ['1.2-2'],
    },
  ];
  variableColumns = ['variableName'];

  cohortIds: number[] = [];
  selectedCohort?: CohortModel;
  lastVersion = true;
  pollUuid = '';

  students: StudentRiskAverage[] = [];
  totalStudents = 0;

  isLoading = false;
  isGeneratingPDF = false;
  title = '';
  components = signal<PollAvgReport | null>(null);
  heatmapChart = true;

  constructor(private snackBar: MatSnackBar) {}

  getStudentsByCohortAndPoll(event: EventLoad) {
    if (this.cohortIds.length && this.pollUuid) {
      this.isLoading = true;
      this.studentService
        .getAllAverageByCohortsAndPoll({
          page: event.page,
          pageSize: event.pageSize,
          cohortIds: this.cohortIds,
          pollUuid: this.pollUuid,
          lastVersion: this.lastVersion,
        })
        .subscribe(response => {
          this.students = response.items;
          this.totalStudents = response.count;
          this.isLoading = false;
        });
    } else {
      this.students = [];
      this.totalStudents = 0;
    }
  }

  getHeatMap() {
    if (!this.pollUuid || !this.cohortIds.length) {
      this.chartOptions = {};
      return;
    }

    this.reportService
      .getAvgPoolReport(this.pollUuid, this.cohortIds, this.lastVersion)
      .subscribe(response => {
        this.components.set(response.body);

        const reportSeries = this.reportService.getHMSeriesFromAvgReport(
          response.body
        );
        const series = this.reportService.regroupSummaryByColor(reportSeries);
        this.chartOptions = GetChartOptions(`${this.title}`, series, (x, y) => {
          const component = series[y];
          const serieQuestion = series[y].data[x];
          const pollAvgQuestion = this.getPollAvgQuestionFromSeries(
            response.body,
            component.description,
            serieQuestion
          );

          if (!pollAvgQuestion) {
            console.error('Error getting question from report.');
          } else {
            this.openDetailsModal(
              pollAvgQuestion,
              component.description as ComponentValueType,
              component.text
            );
          }
        });
      });
  }

  getPollAvgQuestionFromSeries(
    report: PollAvgReport,
    componentName: string,
    serieQuestion: SummarySerie
  ): PollAvgQuestion | null {
    const reportComponent = report.components.find(c =>
      componentName.includes(c.description)
    );
    const question = reportComponent?.questions.find(
      question =>
        question.question === serieQuestion.x &&
        question.averageRisk === serieQuestion.y &&
        (question.position === undefined ||
          question.position === serieQuestion.position)
    );

    return question ?? null;
  }

  async exportReportPdf() {
    if (this.isGeneratingPDF) return;

    this.isGeneratingPDF = true;
    await this.pdfHelper.exportToPdf({
      fileName: 'cohort_report',
      container: this.contentToExport,
      snackBar: this.snackBar,
    });
    this.isGeneratingPDF = false;
  }

  openDetailsModal(
    question: PollAvgQuestion,
    componentName: ComponentValueType,
    text?: string
  ): void {
    if (!this.pollUuid) return;
    const data: SelectedHMData = {
      cohortId: this.selectedCohort?.id.toString() || '0',
      pollUuid: this.pollUuid,
      componentName,
      text: text ?? componentName,
      question,
    };
    this.dialog.open(ModalQuestionDetailsComponent, { data });
  }

  handleFilterSelect(filters: Filter) {
    this.cohortIds = filters.cohortIds;
    this.title = filters.title;
    this.pollUuid = filters.uuid;
    this.lastVersion = filters.lastVersion;
    this.getStudentsByCohortAndPoll({ pageSize: 10, page: 0 });
    this.getHeatMap();
  }

  toggleChart(chart: string) {
    this.heatmapChart = chart === 'heatmap';
  }
}
