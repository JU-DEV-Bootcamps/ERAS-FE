import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { ListComponent } from '@shared/components/list/list.component';
import { BadgeRiskComponent } from '@shared/components/badge-risk-level/badge-risk-level.component';
import { PollModel } from '@core/models/poll.model';
import { CohortComponents } from '@core/models/cohort-components.model';
import { StudentRiskResponse } from '@core/models/cohort.model';
import { Column } from '@shared/components/list/types/column';
import { PollService } from '@core/services/api/poll.service';
import { PollInstanceService } from '@core/services/api/poll-instance.service';
import { StudentService } from '@core/services/api/student.service';
import { toSentenceCase } from '@core/utilities/string-utils';
import { EventAction } from '@shared/events/load';
import { ModalStudentDetailComponent } from '../../modal-student-detail/modal-student-detail.component';
import { MapClass } from '@shared/components/list/types/class';
import { ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-student-monitoring-details',
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
    MatTableModule,
    MatDividerModule,
    ListComponent,
    BadgeRiskComponent,
  ],
  templateUrl: './student-monitoring-details.component.html',
  styleUrl: './student-monitoring-details.component.scss',
})
export class StudentMonitoringDetailsComponent implements OnInit {
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  pollSelected: PollModel | null = null;
  cohortSelected: CohortComponents | null = null;
  selectedComponents: { key: string; value: number }[] = [];
  componentStudentRisk: Record<string, StudentRiskResponse[]> = {};
  riskStudentsDetail: StudentRiskResponse[] = [];
  filteredStudents: StudentRiskResponse[] = [];
  studentRisk: StudentRiskResponse[] = [];

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

  columns: Column<StudentRiskResponse>[] = [
    { key: 'studentName', label: 'Student Name' },
    { key: 'answerAverage', label: 'Answers Avg. Risk' },
  ];
  columnTemplates: Column<StudentRiskResponse>[] = [
    { key: 'riskSum', label: 'Risk Level' },
  ];
  actionDatas = [
    {
      columnId: 'actions',
      id: 'openStudentDetails',
      label: 'Actions',
      ngIconName: 'visibility',
      tooltip: 'View details',
    },
  ];

  mapClass: MapClass = {
    table: { table: 'bg-transparent' },
    paginator: 'bg-transparent',
  };

  lastVersion = false;
  quantities = [3, 5, 10, 15, 20];
  selectedQuantity = 3;
  polls: PollModel[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private pollService: PollService,
    private pollInstanceService: PollInstanceService,
    private studentService: StudentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const pollUuid = params.get('pollUuid');
      const cohortId = Number(params.get('cohortId'));
      const lastVersionParam = params.get('lastVersion');

      this.lastVersion = lastVersionParam === 'true';

      if (pollUuid && cohortId) {
        this.pollService.getAllPolls().subscribe(polls => {
          this.polls = polls;
          this.pollSelected = polls.find(p => p.uuid === pollUuid) || null;

          if (!this.pollSelected) return;

          this.pollInstanceService
            .getComponentsAvgGroupedByCohorts(pollUuid, this.lastVersion)
            .subscribe(cohorts => {
              const foundCohort = cohorts.find(c => c.cohortId === cohortId);
              if (!foundCohort) return;

              this.cohortSelected = {
                ...foundCohort,
                componentsAvg: this.cleanComponentsAvg(
                  foundCohort.componentsAvg
                ),
              };

              this.selectedComponents = Object.entries(
                this.cohortSelected?.componentsAvg as Record<string, number>
              ).map(([key, value]) => ({
                key: toSentenceCase(key),
                value: Number(value.toFixed(2)),
              }));

              this.loadRiskStudents();
              this.cdr.detectChanges();
            });
        });
      }
    });
  }

  private cleanComponentsAvg(input: unknown): Record<string, number> {
    const result: Record<string, number> = {};

    // Caso 1: array de objetos (antiguo formato)
    if (Array.isArray(input)) {
      input.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
          const numeric = Number(value);
          if (!isNaN(numeric)) {
            result[key] = numeric;
          }
        });
      });
    }
    // Caso 2: objeto plano (nuevo formato del backend)
    else if (input && typeof input === 'object') {
      Object.entries(input as Record<string, unknown>).forEach(
        ([key, value]) => {
          const numeric = Number(value);
          if (!isNaN(numeric)) {
            result[key] = numeric;
          }
        }
      );
    }

    return result;
  }

  loadRiskStudents(): void {
    const uuid = this.pollSelected?.uuid;
    const cohortId = this.cohortSelected?.cohortId;
    if (!uuid || cohortId === undefined) return;
    this.studentService
      .getPollTopStudents(uuid, cohortId, this.lastVersion)
      .subscribe(data => {
        this.riskStudentsDetail = data;
        this.updateTable();
      });
  }

  goBack(): void {
    this.router.navigate([
      '/student-option',
      this.pollSelected?.uuid,
      this.lastVersion,
    ]);
  }

  getChartSeriesData(cohort: CohortComponents): number[] {
    const avg = cohort?.componentsAvg;
    return avg ? Object.values(avg).map(val => +val) : [];
  }

  getChartLabels(cohort: CohortComponents): string[] {
    const avg = cohort?.componentsAvg;
    return avg ? Object.keys(avg) : [];
  }

  loadComponentData(componentKey: string): void {
    if (!this.pollSelected || !this.cohortSelected) return;

    this.studentService
      .getPollComponentTopStudents(
        this.pollSelected.uuid,
        componentKey,
        this.cohortSelected.cohortId,
        this.lastVersion
      )
      .subscribe(data => {
        this.componentStudentRisk[componentKey] = data;
        this.cdr.detectChanges();
      });
  }

  handleLoad(): void {
    if (!this.pollSelected || !this.cohortSelected) return;

    this.studentService
      .getPollTopStudents(
        this.pollSelected.uuid,
        this.cohortSelected.cohortId,
        this.lastVersion
      )
      .subscribe(data => {
        this.riskStudentsDetail = data;
        this.updateTable();
      });
  }

  updateTable(): void {
    this.filteredStudents = this.riskStudentsDetail.slice(
      0,
      this.selectedQuantity
    );
  }

  handleActionCalled(event: EventAction) {
    const actions: Record<string, (item: StudentRiskResponse) => void> = {
      openStudentDetails: (element: StudentRiskResponse) => {
        this.openStudentDetails(element.studentId.toString());
      },
    };

    if (actions[event.data.id]) {
      actions[event.data.id](event.item as StudentRiskResponse);
    }
  }

  expandAllPanels(): void {
    this.accordion.openAll();
  }

  collapseAllPanels(): void {
    this.accordion.closeAll();
  }

  openStudentDetails(studentId: string): void {
    this.dialog.open(ModalStudentDetailComponent, {
      width: 'clamp(520px, 50vw, 980px)',
      maxWidth: '90vw',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: { studentId },
    });
  }
}
