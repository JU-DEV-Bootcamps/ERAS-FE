import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DialogRiskVariableData } from '../../heat-map/types/risk-students-variables.type';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { Poll } from '../../list-students-by-poll/types/list-students-by-poll';
import { ApexOptions } from 'ng-apexcharts';
import { StudentRiskResponse } from '../../../core/models/cohort.model';
import { toSentenceCase } from '../../../core/utilities/string-utils';
import { MatTableModule } from '@angular/material/table';
import { RISK_COLORS, RiskColorType } from '../../../core/constants/riskLevel';
import { CohortComponents } from '../../../core/models/cohort-components.model';
import { PollService } from '../../../core/services/api/poll.service';
import { HeatMapService } from '../../../core/services/api/heat-map.service';
import { StudentService } from '../../../core/services/api/student.service';
import { PollInstanceService } from '../../../core/services/api/poll-instance.service';
import { MatDividerModule } from '@angular/material/divider';
import { ModalStudentDetailComponent } from '../../modal-student-detail/modal-student-detail.component';

@Component({
  selector: 'app-student-detail-option',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatTabsModule,
    MatCardModule,
    CommonModule,
    MatRadioModule,
    MatExpansionModule,
    MatTableModule,
    MatDividerModule,
  ],
  templateUrl: './student-detail-option.component.html',
  styleUrl: './student-detail-option.component.scss',
})
export class StudentDetailOptionComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  public modalDataSudentVariable: DialogRiskVariableData =
    {} as DialogRiskVariableData;

  pollSeleccionado: Poll | null = null;
  pollSeleccionadoId: number | null = null;
  cohortSeleccionado: CohortComponents | null = null;
  selectedComponents: { key: string; value: number }[] = [];
  componentStudentRisk: Record<string, StudentRiskResponse[]> = {};
  pollsService = inject(PollService);
  pollInstanceService = inject(PollInstanceService);
  studentService = inject(StudentService);
  heatMapService = inject(HeatMapService);
  studentsService = inject(StudentService);
  selectedQuantity = 3;
  quantities = [3, 5, 10, 15, 20];
  accordion = viewChild.required(MatAccordion);

  polls: Poll[] = [];
  studentRisk: StudentRiskResponse[] = [];
  cohorts: CohortComponents[] = [];
  readonly panelOpenState = signal(false);
  riskStudentsDetail: StudentRiskResponse[] = [];
  filteredStudents = [...this.riskStudentsDetail];
  columns = ['studentName', 'answerAverage', 'riskLevel', 'actions'];

  public chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 400,
      animations: {
        enabled: false,
      },
    },
    labels: [],
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560'],
    legend: {
      position: 'right',
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return `${val.toFixed(1)} %`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
      },
    ],
  };

  ngOnInit(): void {
    this.pollsService
      .getAllPolls()
      .subscribe(pollsList => (this.polls = pollsList));
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {}

  selectPoll(): void {
    const poll = this.polls.find(p => p.id === this.pollSeleccionadoId);
    if (poll) {
      this.pollSeleccionado = poll;
      this.location.go('/' + this.pollSeleccionado.name);
      this.pollInstanceService
        .getComponentsAvgGroupedByCohorts(poll.uuid)
        .subscribe(response => {
          this.cohorts = response.map(cohort => ({
            ...cohort,
            componentsAvg:
              typeof cohort.componentsAvg === 'object' &&
              cohort.componentsAvg !== null
                ? { ...cohort.componentsAvg }
                : {},
          }));
        });
    }
  }

  getChartSeriesData(cohort: CohortComponents): number[] {
    const avg = cohort.componentsAvg;

    if (typeof avg !== 'object' || avg === null) return [];

    return Object.values(avg).map(val =>
      typeof val === 'number' ? val : parseFloat(val)
    );
  }

  getChartLabels(cohort: CohortComponents): string[] {
    const avg = cohort.componentsAvg;

    if (typeof avg !== 'object' || avg === null) return [];
    return Object.keys(avg);
  }

  loadComponentData(componentKey: string) {
    if (!this.pollSeleccionado || !this.cohortSeleccionado) return;
    this.studentService
      .getPollComponentTopStudents(
        this.pollSeleccionado.uuid,
        componentKey,
        this.cohortSeleccionado.cohortId
      )
      .subscribe(data => {
        this.componentStudentRisk[componentKey] = data;
        this.cdr.detectChanges();
      });
  }

  getColorRisk(riskLevel: RiskColorType) {
    return RISK_COLORS[riskLevel] || RISK_COLORS.default;
  }

  goBack() {
    if (this.pollSeleccionado && this.cohortSeleccionado) {
      this.cohortSeleccionado = null;
      this.location.go('/' + this.pollSeleccionado.name);
    } else {
      this.pollSeleccionado = null;
      this.location.go('/');
    }
  }

  updateTable() {
    this.filteredStudents = this.riskStudentsDetail.slice(
      0,
      this.selectedQuantity
    );
  }

  selectCohort(cohort: CohortComponents): void {
    if (!this.pollSeleccionado) return;
    this.cohortSeleccionado = cohort;
    this.location.go(
      '/' +
        this.pollSeleccionado.name +
        '/' +
        this.cohortSeleccionado.cohortName
    );
    this.selectedComponents = Object.entries(
      this.cohortSeleccionado.componentsAvg as Record<string, number>
    ).map(([key, value]) => ({
      key: toSentenceCase(key),
      value: Number(value.toFixed(2)),
    }));

    this.studentService
      .getPollTopStudents(
        this.pollSeleccionado.uuid,
        this.cohortSeleccionado.cohortId
      )
      .subscribe({
        next: data => {
          this.riskStudentsDetail = data;
          this.updateTable();
        },
        error: error => {
          console.error('Error fetching risk student details by cohort', error);
        },
      });
  }

  openStudentDetails(studentId: string): void {
    console.log('Entra');
    this.dialog.open(ModalStudentDetailComponent, {
      width: 'clamp(520px, 50vw, 980px)',
      maxWidth: '90vw',
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: { studentId: studentId },
    });
  }
}
