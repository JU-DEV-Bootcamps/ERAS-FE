import {
  Component,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { StudentService } from '../../../core/services/student.service';
import { CohortService } from '../../../core/services/cohort.service';
import { PollService } from '../../../core/services/poll.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { Cohort } from '../../../core/services/Types/cohort.type';
import { Poll, PollVariable } from '../../../core/services/Types/poll.type';
import { StudentRiskAverage } from '../../../core/services/Types/student.type';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RISK_COLORS, RiskColorType } from '../../../core/constants/riskLevel';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PdfService } from '../../../core/services/report/pdf.service';
import { generateFileName } from '../../../core/utilities/file/file-name';

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
  ],
  templateUrl: './students-risk.component.html',
  styleUrl: './students-risk.component.scss',
})
export class StudentsRiskComponent implements OnInit {
  studentService = inject(StudentService);
  cohortService = inject(CohortService);
  pollsService = inject(PollService);
  pdfService = inject(PdfService);

  @ViewChild('contentToExport') contentToExport!: ElementRef;

  selectForm = new FormGroup({
    cohortId: new FormControl<number | null>(null, [Validators.required]),
    pollId: new FormControl<number | null>(null, [Validators.required]),
  });

  columns = ['studentName', 'email', 'avgRiskLevel'];
  variableColumns = ['variableName'];

  cohorts: Cohort[] = [];
  polls: Poll[] = [];

  pollVariables: PollVariable[] = [];

  students: StudentRiskAverage[] = [];

  load = false;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.getCohorts();
    this.selectForm.controls['cohortId'].valueChanges.subscribe(value => {
      if (value) this.getPollsByCohortId(value);
    });

    this.selectForm.valueChanges.subscribe(value => {
      if (value.cohortId && value.pollId) {
        this.getStudentsByCohortAndPoll();
        this.getPollVariables();
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
        .getAllAverageByCohortAndPoll({
          cohortId: this.selectForm.value.cohortId,
          pollId: this.selectForm.value.pollId,
        })
        .subscribe(res => {
          this.students = res;
          this.load = true;
        });
    }
  }

  getCohorts() {
    this.cohortService.getCohorts().subscribe(data => {
      this.cohorts = data;
    });
  }

  getPollsByCohortId(id: number) {
    this.pollsService.getPollsByCohortId(id).subscribe(data => {
      this.polls = data;
    });
  }

  getPollVariables() {
    if (this.selectForm.invalid) {
      return;
    }
    if (this.selectForm.value.cohortId && this.selectForm.value.pollId) {
      this.pollsService
        .getByCohortAndPoll(
          this.selectForm.value.cohortId,
          this.selectForm.value.pollId
        )
        .subscribe(res => {
          this.pollVariables = res;
        });
    }
  }

  getColorRisk(riskLevel: number) {
    const option = Math.floor(riskLevel) as RiskColorType;
    return RISK_COLORS[option] || RISK_COLORS.default;
  }
  cloneAndResizeElement(
    originalElement: HTMLElement,
    newWidth: string
  ): HTMLElement {
    const clonedElement = originalElement.cloneNode(true) as HTMLElement;
    this.renderer.setStyle(clonedElement, 'width', newWidth);
    this.renderer.setStyle(clonedElement, 'position', 'absolute');
    this.renderer.setStyle(clonedElement, 'left', '-9999px');
    return clonedElement;
  }

  downloadPDF() {
    const fileName = generateFileName('cohort_report');
    const clonedElement = this.cloneAndResizeElement(
      this.contentToExport.nativeElement,
      '800px'
    );

    document.body.appendChild(clonedElement);

    this.pdfService.exportToPDF(clonedElement, fileName, () => {
      document.body.removeChild(clonedElement);
    });
  }
}
