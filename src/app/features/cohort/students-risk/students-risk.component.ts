import { DecimalPipe } from '@angular/common';
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
import { RISK_COLORS, RiskColorType } from '../../../core/constants/riskLevel';
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
import { PollAvgQuestion } from '../../../core/models/summary.model';
import { EmptyDataComponent } from '../../../shared/components/empty-data/empty-data.component';
import { StudentService } from '../../../core/services/api/student.service';
import { CohortService } from '../../../core/services/api/cohort.service';
import { PollService } from '../../../core/services/api/poll.service';
import { ReportService } from '../../../core/services/api/report.service';

@Component({
  selector: 'app-students-risk',
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatTableModule,
    MatProgressBarModule,
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgApexchartsModule,
    EmptyDataComponent,
  ],
  templateUrl: './students-risk.component.html',
  styleUrl: './students-risk.component.scss',
})
export class StudentsRiskComponent implements OnInit {
  studentService = inject(StudentService);
  cohortService = inject(CohortService);
  pollsService = inject(PollService);
  pdfService = inject(PdfService);
  reportService = inject(ReportService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('contentToExport') contentToExport!: ElementRef;

  chartOptions: ApexOptions = {};

  selectForm = new FormGroup({
    cohortId: new FormControl<number | null>(null, [Validators.required]),
    pollId: new FormControl<number | null>(null, [Validators.required]),
  });

  columns = ['studentName', 'email', 'avgRiskLevel'];
  variableColumns = ['variableName'];

  cohorts: CohortModel[] = [];
  selectedCohort?: CohortModel;
  selectedPoll?: PollModel;
  polls: PollModel[] = [];

  students: StudentRiskAverage[] = [];

  load = false;

  ngOnInit() {
    this.getPolls();
    this.selectForm.controls['pollId'].valueChanges.subscribe(value => {
      if (value) {
        this.selectedPoll = this.polls.find(p => p.id == value);
        this.getCohortsByPoll(value);
      }
    });

    this.selectForm.valueChanges.subscribe(value => {
      if (value.cohortId !== null && value.pollId) {
        this.selectedCohort = this.cohorts.find(c => c.id == value);
        this.getStudentsByCohortAndPoll();
        this.getHeatMap();
      }
    });
  }

  getStudentsByCohortAndPoll() {
    if (this.selectForm.invalid) {
      return;
    }
    if (this.selectForm.value.cohortId && this.selectForm.value.pollId) {
      this.load = false;
      this.studentService
        .getAllAverageByCohortAndPoll(
          this.selectForm.value.cohortId,
          this.selectForm.value.pollId
        )
        .subscribe(res => {
          this.students = res;
          this.load = true;
        });
    }
  }

  getPolls() {
    this.pollsService.getAllPolls().subscribe(data => {
      this.polls = data;
    });
  }

  getCohortsByPoll(id: number) {
    this.cohortService.getCohorts().subscribe(data => {
      console.warn('API Call needs to filter by poll Id:', id);
      this.cohorts = data;
    });
  }

  getColorRisk(riskLevel: number) {
    const option = Math.floor(riskLevel) as RiskColorType;
    return RISK_COLORS[option] || RISK_COLORS.default;
  }

  getHeatMap() {
    if (!this.selectedPoll) return;
    this.reportService
      .getAvgPoolReport(this.selectedPoll.uuid, this.selectedCohort?.id || 0)
      .subscribe(res => {
        const reportSeries = this.reportService.getHMSeriesFromAvgReport(
          res.body
        );
        this.chartOptions = GetChartOptions(
          `Risk Heatmap - ${this.selectedPoll?.name}-${this.selectedCohort?.name || 'All Cohorts'}`,
          reportSeries,
          (x, y) => {
            const compReport = res.body.components[y];
            const selectedQuestion = compReport.questions[x];
            this.openDetailsModal(selectedQuestion, compReport.description);
          }
        );
      });
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
      pollUuid: this.selectedPoll?.uuid,
      componentName,
      question,
    };
    this.dialog.open(ModalQuestionDetailsComponent, { data });
  }
}
