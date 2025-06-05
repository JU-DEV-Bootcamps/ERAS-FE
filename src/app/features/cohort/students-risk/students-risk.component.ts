import { CommonModule, DecimalPipe } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { CohortModel } from '../../../core/models/cohort.model';
import { PdfService } from '../../../core/services/exports/pdf.service';
import { generateFileName } from '../../../core/utilities/file/file-name';
import { PollModel } from '../../../core/models/poll.model';
import { StudentRiskAverage } from '../../../core/services/interfaces/student.interface';
import { MatDialog } from '@angular/material/dialog';
import { GetChartOptions } from '../util/heat-map-config';
import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from '../../heat-map/modal-question-details/modal-question-details.component';
import {
  PollAvgQuestion,
  PollAvgReport,
} from '../../../core/models/summary.model';
import { EmptyDataComponent } from '../../../shared/components/empty-data/empty-data.component';
import { StudentService } from '../../../core/services/api/student.service';
import { CohortService } from '../../../core/services/api/cohort.service';
import { PollService } from '../../../core/services/api/poll.service';
import { ReportService } from '../../../core/services/api/report.service';
import { ListComponent } from '../../../shared/components/list/list.component';
import { Column } from '../../../shared/components/list/types/column';
import { SelectAllDirective } from '../../../shared/directives/select-all.directive';
import { Serie } from '../../../core/models/heatmap-data.model';

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
    SelectAllDirective,
    ListComponent,
    CommonModule,
  ],
  templateUrl: './students-risk.component.html',
  styleUrl: './students-risk.component.scss',
})
export class StudentsRiskComponent implements OnInit {
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
  selectedCohort?: CohortModel;
  selectedPoll?: PollModel;
  polls: PollModel[] = [];

  students: StudentRiskAverage[] = [];
  totalStudents = 0;

  isLoading = false;

  filterForm = new FormGroup({
    pollId: new FormControl<number>(-1, [Validators.required]),
    cohortIds: new FormControl<number[]>([], [Validators.required]),
  });

  ngOnInit() {
    this.pollsService.getAllPolls().subscribe({
      next: res => (this.polls = res),
      error: () => (this.polls = []),
    });
    this.filterForm.controls.pollId.valueChanges.subscribe(value => {
      if (value) {
        this.cohortsService.getCohortsByPollId(value).subscribe(res => {
          this.cohorts = res.body;
          this.filterForm.controls.cohortIds.setValue(
            this.cohorts.map(c => c.id)
          );
          this.handleCohortSelect(false);
        });
        this.selectedPoll = this.polls.find(p => p.id == value);
      }
    });
  }

  handleCohortSelect(isOpen: boolean) {
    if (isOpen) return;
    if (!this.filterForm.value.pollId) return;
    if (this.filterForm.value.cohortIds?.length === 0) return;
    this.getStudentsByCohortAndPoll();
    this.getHeatMap();
  }

  getStudentsByCohortAndPoll() {
    if (this.filterForm.invalid) {
      return;
    }
    if (this.filterForm.value.cohortIds && this.filterForm.value.pollId) {
      this.isLoading = false;
      this.studentService
        .getAllAverageByCohortsAndPollId(
          this.filterForm.value.cohortIds,
          this.filterForm.value.pollId
        )
        .subscribe(res => {
          this.students = res;
          this.totalStudents = res.length;
          this.isLoading = true;
        });
    }
  }

  getCohortsByPoll(id: number) {
    this.cohortsService.getCohortsByPollId(id).subscribe(data => {
      this.cohorts = data.body;
    });
  }

  getHeatMap() {
    if (!this.selectedPoll) return;
    if (this.filterForm.invalid) return;

    this.reportService
      .getAvgPoolReport(
        this.selectedPoll.uuid,
        this.filterForm.value.cohortIds!
      )
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
}
