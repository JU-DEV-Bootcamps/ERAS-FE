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
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgFor } from '@angular/common';
import { MatSelectChange } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CohortService } from '../../core/services/cohort.service';
import { PollInstanceService } from '../../core/services/poll-instance.service';
import { PollInstance } from '../../core/services/Types/pollInstance';
import { TimestampToDatePipe } from '../../shared/pipes/timestamp-to-date.pipe';

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
  columns = ['uuid', 'finishedAt', 'name', 'email', 'modifiedAt'];
  columnsText = [
    'Uuid',
    'Finished At',
    'Student Name',
    'Student Email',
    'Modified At',
  ];

  dropDays = ['1', '5', '15', '30', '60', '+ 60'];

  pollInstanceService = inject(PollInstanceService);
  cohortService = inject(CohortService);

  loading = true;
  data = new MatTableDataSource<PollInstance>([]);
  pollInstances: PollInstance[] = [];

  cohortsData: Cohort[] = [];
  selectedCohortId = 0;
  selectedDay = this.dropDays[3];

  filtersForm = new FormGroup({
    cohortId: new FormControl(this.selectedCohortId),
    dropDays: new FormControl(this.selectedDay),
  });

  pageSize = 10;
  currentPage = 0;

  isMobile = false;

  ngOnInit(): void {
    this.loadCohortsList();
    this.loadPollInstances(this.selectedCohortId, this.selectedDay);
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

  loadPollInstances(cohortId: number, days: string): void {
    this.pollInstanceService
      .getPollInstancesByFilters(cohortId, parseInt(days))
      .subscribe(data => {
        this.loading = true;
        this.data = new MatTableDataSource<PollInstance>(data.body);
        this.pollInstances = data.body;
        this.loading = false;
      });
  }

  onSelectionChange(event: MatSelectChange) {
    const controlName = event.source.ngControl.name;
    let selectedValue = event.value;
    if (controlName === 'dropDays') {
      if (selectedValue == '+ 60') selectedValue = '0';
      this.selectedDay = selectedValue;
      this.loadPollInstances(this.selectedCohortId, selectedValue);
    } else if (controlName === 'cohortId') {
      const select = this.cohortsData.find(
        cohort => cohort.id === selectedValue
      );
      if (select) this.selectedCohortId = select.id;
      this.loadPollInstances(selectedValue, this.selectedDay);
    }
  }

  generateHeatMap(): void {
    // TODO: Create heatmap with filters
    console.log('Generating Heat Map');
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

interface Cohort {
  id: number;
  name: string;
  courseCode: string;
  audit: {
    createdBy: string;
    modifiedBy: string;
    createdAt: string;
    modifiedAt: string;
  };
}
