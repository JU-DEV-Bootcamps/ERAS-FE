import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CohortService } from '../../core/services/cohort.service';
import { PollInstanceService } from '../../core/services/poll-instance.service';
import { PollInstance } from '../../core/services/Types/pollInstance';
import { TimestampToDatePipe } from '../../shared/pipes/timestamp-to-date.pipe';
import { Router } from '@angular/router';
import { PollService } from '../../core/services/poll.service';
import { Poll } from '../../core/services/Types/poll.type';
import { Cohort } from '../../core/services/Types/cohort.type';

@Component({
  selector: 'app-list-poll-instances-by-filters',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    NgFor,
    ReactiveFormsModule,
    TimestampToDatePipe,
  ],
  templateUrl: './list-poll-instances-by-filters.component.html',
  styleUrl: './list-poll-instances-by-filters.component.scss',
})
export class ListPollInstancesByFiltersComponent implements OnInit {
  private readonly router = inject(Router);
  columns = ['uuid', 'finishedAt', 'name', 'email', 'modifiedAt'];
  columnsText = [
    'Uuid',
    'Finished At',
    'Student Name',
    'Student Email',
    'Modified At',
  ];

  pollService = inject(PollService);
  pollInstanceService = inject(PollInstanceService);
  cohortService = inject(CohortService);

  loading = true;
  data = new MatTableDataSource<PollInstance>([]);
  pollInstances: PollInstance[] = [];

  cohortsData: Cohort[] = [];
  polls: Poll[] = [];
  selectedCohortId = 0;
  selectedPollUuid = '';

  filtersForm = new FormGroup({
    selectedCohort: new FormControl<number | null>(null, [Validators.required]),
    selectedPoll: new FormControl<string | null>(null, [Validators.required]),
  });

  pageSize = 10;
  currentPage = 0;

  isMobile = false;

  ngOnInit(): void {
    this.loadCohortsList();
    this.filtersForm.controls['selectedCohort'].valueChanges.subscribe(
      value => {
        if (value) {
          this.getPollsByCohortId(value);
          this.selectedCohortId = value;
        }
      }
    );
    this.filtersForm.controls['selectedPoll'].valueChanges.subscribe(value => {
      if (value) this.selectedPollUuid = value;
    });
    this.loadPollInstances(this.selectedCohortId);
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  loadCohortsList(): void {
    this.cohortService.getCohorts().subscribe(data => {
      const defaultOpt: Cohort = {
        name: 'All Cohorts',
        courseCode: '',
        audit: {
          createdBy: '',
          modifiedBy: '',
          createdAt: '',
          modifiedAt: '',
        },
        id: 0,
      };
      this.cohortsData = data;
      this.cohortsData.push(defaultOpt);
    });
  }

  getPollsByCohortId(id: number) {
    this.pollService.getPollsByCohortId(id).subscribe(data => {
      this.polls = data;
    });
  }

  loadPollInstances(cohortId: number): void {
    this.pollInstanceService
      .getPollInstancesByFilters(cohortId, 0)
      .subscribe(data => {
        this.loading = true;
        this.data = new MatTableDataSource<PollInstance>(
          data.body.filter(p => p.uuid == this.selectedPollUuid)
        );
        this.pollInstances = data.body;
        this.loading = false;
      });
  }

  onSelectionChange() {
    if (this.filtersForm.invalid) return;
    if (
      this.filtersForm.value.selectedCohort &&
      this.filtersForm.value.selectedPoll
    ) {
      this.loadPollInstances(this.filtersForm.value.selectedCohort);
    }
  }

  generateHeatMap(): void {
    const url = this.router
      .createUrlTree(['/heat-map-summary'], {
        queryParams: {
          cohortId: this.filtersForm.value.selectedCohort,
          pollUuid: this.filtersForm.value.selectedPoll,
        },
      })
      .toString();
    window.open(url, '_blank');
  }

  goToDetails(pollInstance: PollInstance): void {
    window.open(`student-details/${pollInstance.student.id}`, '_blank');
  }

  getWidth(column: string): string {
    switch (column) {
      case 'modifiedAt':
      case 'finishedAt':
        return '15%';
      case 'name':
      case 'email':
        return '20%';
      default:
        return '';
    }
  }
}
