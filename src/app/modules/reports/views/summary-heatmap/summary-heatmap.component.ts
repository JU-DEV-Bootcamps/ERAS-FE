import { CommonModule, DecimalPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { CohortModel } from '../../../../core/models/cohort.model';
import { PdfService } from '../../../../core/services/exports/pdf.service';
import { generateFileName } from '../../../../core/utilities/file/file-name';
import { PollModel } from '../../../../core/models/poll.model';
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
import { CohortService } from '../../../../core/services/api/cohort.service';
import { PollService } from '../../../../core/services/api/poll.service';
import { ReportService } from '../../../../core/services/api/report.service';
import { ListComponent } from '../../../../shared/components/list/list.component';
import { Column } from '../../../../shared/components/list/types/column';
import { Serie } from '../../../../core/models/heatmap-data.model';
import { PollFiltersComponent } from '../../components/poll-filters/poll-filters.component';
import { Filter } from '../../components/poll-filters/types/filters';

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
export class SummaryHeatmapComponent implements OnInit {
  studentService = inject(StudentService);
  cohortsService = inject(CohortService);
  pollsService = inject(PollService);
  pdfService = inject(PdfService);
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

  cohorts: CohortModel[] = [];
  cohortIds: number[] = [];
  selectedCohort?: CohortModel;
  selectedPoll?: PollModel;
  polls: PollModel[] = [];

  students: StudentRiskAverage[] = [];
  totalStudents = 0;

  isLoading = false;

  ngOnInit() {
    this.pollsService.getAllPolls().subscribe({
      next: res => {
        this.polls = res;
        this.selectedPoll = this.polls[0];
      },
      error: () => (this.polls = []),
    });
  }

  handleCohortSelect(isOpen: boolean) {
    if (isOpen) return;
    this.getStudentsByCohortAndPoll();
    this.getHeatMap();
  }

  getStudentsByCohortAndPoll() {
    if (this.cohortIds && this.selectedPoll && this.selectedPoll.id) {
      this.isLoading = true;
      this.studentService
        .getAllAverageByCohortsAndPoll(this.cohortIds, this.selectedPoll.uuid)
        .subscribe(res => {
          this.students = res;
          this.totalStudents = res.length;
          this.isLoading = false;
        });
    }
  }

  getHeatMap() {
    if (!this.selectedPoll) return;

    this.reportService
      .getAvgPoolReport(this.selectedPoll.uuid, this.cohortIds)
      .subscribe(res => {
        const reportSeries = this.reportService.getHMSeriesFromAvgReport(
          res.body
        );
        const series = this.reportService.regroupByColor(reportSeries);
        this.chartOptions = GetChartOptions(
          `Risk Heatmap - ${this.selectedPoll?.name}-${this.cohorts && this.cohorts.length === 1 ? this.cohorts[0].name : 'All Cohorts'}`,
          series,
          (x, y) => {
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
          }
        );
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

  downloadPDF() {
    const fileName = generateFileName('cohort_report');

    const clonedElement = this.contentToExport.nativeElement.cloneNode(
      true
    ) as HTMLElement;

    clonedElement.style.width = '800px';

    document.body.appendChild(clonedElement);
    this.pdfService.exportToPDF(clonedElement, fileName);
    document.body.removeChild(clonedElement);
  }

  openDetailsModal(question: PollAvgQuestion, componentName: string): void {
    if (!this.selectedPoll) return;
    const data: SelectedHMData = {
      cohortId: this.selectedCohort?.id.toString() || '0',
      pollUuid: this.selectedPoll?.id.toString(),
      componentName,
      question,
    };
    this.dialog.open(ModalQuestionDetailsComponent, { data });
  }

  handleFilterSelect(filters: Filter) {
    this.cohortIds = filters.cohortIds;
    //this.title = filters.title;
    this.handleCohortSelect(false);
    this.selectedPoll = this.polls.find(p => p.uuid == filters.uuid);
  }
}
