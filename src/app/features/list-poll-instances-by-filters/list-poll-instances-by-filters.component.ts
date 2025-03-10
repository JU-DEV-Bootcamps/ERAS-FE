import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { PollInstanceService } from '../../core/services/poll-instance.service';
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
import { TimestampToDatePipe } from '../../shared/pipes/timestamp-to-date.pipe';
import { CohortService } from '../../core/services/cohort.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  columns = ['uuid', 'finishedAt', 'name', 'email', 'createdAt', 'modifiedAt'];
  columnsText = [
    'Uuid',
    'Finished At',
    'Student Name',
    'Student Email',
    'Created At',
    'Modified At',
  ];

  dropDays = ['1', '5', '15', '30', '60'];

  pollInstanceService = inject(PollInstanceService);
  cohortService = inject(CohortService);

  loading = true;
  data = new MatTableDataSource([]);
  pollInstances = [];

  cohortsData: Cohort[] = [];
  selectedCohort = this.cohortsData[0];
  selectedDay = this.dropDays[3];

  filtersForm = new FormGroup({
    cohortId: new FormControl(''),
    dropDays: new FormControl(this.selectedDay),
  });

  pageSize = 10;
  currentPage = 0;
  totalPollInstances = 0;

  isMobile = false;

  ngOnInit(): void {
    this.loadCohortsList();
    this.loadPollInstances('', this.selectedDay);
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
      this.selectedCohort = data[0];
      this.filtersForm.get('cohortId')?.setValue(data[0].id);
    });
  }

  loadPollInstances(cohortId: string, days: string): void {
    this.pollInstanceService
      .getPollInstancesByLastDays(parseInt(days))
      .subscribe(data => {
        this.loading = true;
        this.data = new MatTableDataSource(data.body);
        this.pollInstances = data.body;
        this.totalPollInstances = data.count;
        this.loading = false;
      });
  }

  onSelectionChange(event: MatSelectChange) {
    const controlName = event.source.ngControl.name;
    const selectedValue = event.value;
    if (controlName === 'dropDays') {
      console.log('Selected days:', selectedValue);
      this.selectedDay = selectedValue;
      this.loadPollInstances('', selectedValue);
      // Handle the change for dropDays
    } else if (controlName === 'cohortId') {
      const select = this.cohortsData.find(
        cohort => cohort.id === selectedValue
      );
      if (select) this.selectedCohort = select;
      console.log('Selected cohort:', select);
      // Handle the change for cohortId
    }
  }

  actionMethod() {
    console.log('Button was clicked!');
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
