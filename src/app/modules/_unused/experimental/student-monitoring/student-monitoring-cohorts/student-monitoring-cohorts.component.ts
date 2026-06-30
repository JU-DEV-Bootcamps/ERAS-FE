import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PollModel } from '@core/models/poll.model';
import { CohortComponents } from '@core/models/cohort-components.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PollService } from '@core/services/api/poll.service';
import { PollInstanceService } from '@core/services/api/poll-instance.service';
import { ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-student-monitoring-cohorts',
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
  ],
  templateUrl: './student-monitoring-cohorts.component.html',
  styleUrl: './student-monitoring-cohorts.component.scss',
})
export class StudentMonitoringCohortsComponent implements OnInit {
  pollSelected: PollModel = {} as PollModel;
  cohorts: CohortComponents[] = [];
  pollUuid = '';
  lastVersion = true;

  chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 400,
      animations: { enabled: false },
    },
    labels: [],
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560'],
    legend: { position: 'right' },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)} %`,
    },
    plotOptions: {
      pie: { donut: { size: '65%' } },
    },
    responsive: [{ breakpoint: 480 }],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pollService: PollService,
    private pollInstanceService: PollInstanceService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.pollUuid = params.get('pollUuid') || '';
      this.lastVersion = params.get('lastVersion') === 'true';

      if (this.pollUuid) {
        this.pollService.getAllPolls().subscribe(polls => {
          const foundPoll = polls.find(p => p.uuid === this.pollUuid);
          if (foundPoll) {
            this.pollSelected = foundPoll;

            this.pollInstanceService
              .getComponentsAvgGroupedByCohorts(this.pollUuid, this.lastVersion)
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
        });
      }
    });
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

  selectCohort(cohort: CohortComponents): void {
    this.router.navigate([
      '/student-option',
      this.pollUuid,
      this.lastVersion,
      cohort.cohortId,
    ]);
  }

  goBack(): void {
    this.router.navigate(['/student-option']);
  }
}
