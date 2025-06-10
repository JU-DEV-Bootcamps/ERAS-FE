import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { CohortModel } from '../../../../core/models/cohort.model';
import { StudentRiskAverage } from '../../../../core/services/interfaces/student.interface';
import { MatDialog } from '@angular/material/dialog';
import { GetChartOptions } from '../../../../features/cohort/util/heat-map-config';
import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from '../../../../features/heat-map/modal-question-details/modal-question-details.component';
import {
  PollAvgQuestion,
  PollAvgReport,
} from '../../../../core/models/summary.model';
import { EmptyDataComponent } from '../../../../shared/components/empty-data/empty-data.component';
import { StudentService } from '../../../../core/services/api/student.service';
import { ReportService } from '../../../../core/services/api/report.service';
import { ListComponent } from '../../../../shared/components/list/list.component';
import { Column } from '../../../../shared/components/list/types/column';
import { Serie } from '../../../../core/models/heatmap-data.model';
import { PollFiltersComponent } from '../../components/poll-filters/poll-filters.component';
import { Filter } from '../../components/poll-filters/types/filters';
import { PdfHelper } from '../../exportReport.util';
import { MatSnackBar } from '@angular/material/snack-bar';

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
      pipeArgs: ['1.2-2'],
    },
  ];
  variableColumns = ['variableName'];

  cohortIds: number[] = [];
  selectedCohort?: CohortModel;
  pollUuid = '';

  students: StudentRiskAverage[] = [];
  totalStudents = 0;

  isLoading = false;
  isGeneratingPDF = false;
  title = '';

  constructor(private snackBar: MatSnackBar) {}

  getStudentsByCohortAndPoll() {
    if (this.cohortIds && this.pollUuid) {
      this.isLoading = true;
      this.studentService
        .getAllAverageByCohortsAndPoll(this.cohortIds, this.pollUuid)
        .subscribe(res => {
          this.students = res;
          this.totalStudents = res.length;
          this.isLoading = false;
        });
    }
  }

  getHeatMap() {
    if (!this.pollUuid) return;

    this.reportService
      .getAvgPoolReport(this.pollUuid, this.cohortIds)
      .subscribe(res => {
        const reportSeries = this.reportService.getHMSeriesFromAvgReport(
          res.body
        );
        const series = this.reportService.regroupByColor(reportSeries);
        this.chartOptions = GetChartOptions(`${this.title}`, series, (x, y) => {
          const component = series[y];
          const serieQuestion = series[y].data[x];
          const pollAvgQuestion = this.getPollAvgQuestionFromSeries(
            res.body,
            component.name,
            serieQuestion
          );

          if (!pollAvgQuestion) {
            console.error('Error getting question from report.');
          } else {
            this.openDetailsModal(pollAvgQuestion, component.name);
          }
        });
      });
  }

  getPollAvgQuestionFromSeries(
    report: PollAvgReport,
    componentName: string,
    serieQuestion: Serie
  ): PollAvgQuestion | null {
    const reportComponent = report.components.find(c =>
      componentName.includes(c.description)
    );
    const question = reportComponent?.questions.find(
      question =>
        question.question === serieQuestion.x &&
        question.averageRisk === serieQuestion.y
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

  openDetailsModal(question: PollAvgQuestion, componentName: string): void {
    if (!this.pollUuid) return;
    const data: SelectedHMData = {
      cohortId: this.selectedCohort?.id.toString() || '0',
      pollUuid: this.pollUuid,
      componentName,
      question,
    };
    this.dialog.open(ModalQuestionDetailsComponent, { data });
  }

  handleFilterSelect(filters: Filter) {
    this.cohortIds = filters.cohortIds;
    this.title = filters.title;
    this.pollUuid = filters.uuid;
    this.getStudentsByCohortAndPoll();
    this.getHeatMap();
  }
}
