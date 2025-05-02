import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
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
import { PollService } from '../../../core/services/poll.service';
import { Poll } from '../../list-students-by-poll/types/list-students-by-poll';
import { CohortComponents } from '../../../shared/models/cohort/cohort-components.model';
import { CohortService } from '../../../core/services/cohort.service';
import { ApexOptions } from 'ng-apexcharts';
import { CohortStudentsRiskByPollResponse } from '../../../core/models/cohort.model';
import { toSentenceCase } from '../../../core/utilities/string-utils';
import { MatTableModule } from '@angular/material/table';
import { RISK_COLORS, RiskColorType } from '../../../core/constants/riskLevel';
import { HeatMapService } from '../../../core/services/heat-map.service';

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
  ],
  templateUrl: './student-detail-option.component.html',
  styleUrl: './student-detail-option.component.scss',
})
export class StudentDetailOptionComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  public modalDataSudentVariable: DialogRiskVariableData =
    {} as DialogRiskVariableData;

  pollSeleccionado: any = null;
  pollSeleccionadoId: number | null = null;
  cohortSeleccionado: any = null;
  selectedComponents: any = null;
  pollsService = inject(PollService);
  cohortsService = inject(CohortService);
  heatMapService = inject(HeatMapService);
  polls: Poll[] = [];
  studentRisk: CohortStudentsRiskByPollResponse[] = [];
  cohorts: CohortComponents[] = [];
  readonly panelOpenState = signal(false);
  riskStudentsDetail: CohortStudentsRiskByPollResponse[] = [];
  columns = ['studentName', 'riskLevel', 'actions'];

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
        return val.toFixed(1) + '%';
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

  seleccionarPoll(): void {
    const poll = this.polls.find(p => p.id === this.pollSeleccionadoId);
    if (poll) {
      this.pollSeleccionado = poll;

      this.cohortsService.getCohortComponents(poll.uuid).subscribe(response => {
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
      typeof val === 'number' ? val : parseFloat(val as any)
    );
  }

  getChartLabels(cohort: CohortComponents): string[] {
    const avg = cohort.componentsAvg;

    if (typeof avg !== 'object' || avg === null) return [];

    return Object.keys(avg);
  }

  loadComponentData(componentKey: string) {
    this.cohortsService
      .getCohortStudentsRiskByPoll(
        this.pollSeleccionado.uuid,
        componentKey,
        this.cohortSeleccionado.cohortId
      )
      .subscribe(data => {
        this.studentRisk = data;
      });
  }

  getColorRisk(riskLevel: RiskColorType) {
    return RISK_COLORS[riskLevel] || RISK_COLORS.default;
  }

  goBack() {
    if (this.pollSeleccionado && this.cohortSeleccionado) {
      this.cohortSeleccionado = null;
    } else {
      this.pollSeleccionado = null;
    }
  }

  interactuarConCohort(cohort: CohortComponents): void {
    this.cohortSeleccionado = cohort;
    console.log('Interacción con:', this.cohortSeleccionado);
    this.selectedComponents = Object.entries(
      this.cohortSeleccionado.componentsAvg as Record<string, number>
    ).map(([key, value]) => ({
      key: toSentenceCase(key),
      value: Number(value.toFixed(2)),
    }));

    this.cohortsService
      .getCohortStudentsRisk(
        this.pollSeleccionado.uuid,
        this.cohortSeleccionado.cohortId
      )
      .subscribe({
        next: data => {
          this.riskStudentsDetail = data;
        },
        error: error => {
          console.error('Error fetching risk student details by cohort', error);
        },
      });
  }
}
