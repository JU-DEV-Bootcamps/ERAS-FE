import { NgFor, TitleCasePipe } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CohortService } from '../../core/services/cohort.service';
import { PollsService } from '../../core/services/polls.service';
import { Router } from '@angular/router';
import { cohort } from '../../shared/models/cohort/cohort.model';

@Component({
  selector: 'app-list-polls-by-cohort',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    TitleCasePipe,
    MatPaginatorModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    NgFor,
  ],
  templateUrl: './list-polls-by-cohort.component.html',
  styleUrl: './list-polls-by-cohort.component.scss',
})
export class ListPollsByCohortComponent implements OnInit {
  columns = ['id', 'name', 'uuid', 'version'];

  isMobile = false;
  pageSize = 10;
  currentPage = 0;
  totalPolls = 0;

  cohortsData: cohort[] = [];
  cohortService = inject(CohortService);
  selectedCohort = this.cohortsData[0];

  pollsService = inject(PollsService);
  dataPolls = new MatTableDataSource([]);
  polls = [];

  cohortFormGroup = new FormGroup({
    cohortId: new FormControl(''),
  });

  router = inject(Router);

  loadCohortsList(): void {
    this.cohortService.getCohorts().subscribe({
      next: (cohorts: cohort[]) => {
        this.cohortsData = cohorts;
        this.selectedCohort = cohorts[0];
        this.cohortFormGroup
          .get('cohortId')
          ?.setValue(this.selectedCohort.id.toString());
      },
      error: error => {
        console.log(error);
      },
    });
  }

  loadPolls(): void {
    this.pollsService
      .getPollsByCohortId(this.selectedCohort.id)
      .subscribe(data => {
        this.dataPolls = new MatTableDataSource(data);
        this.polls = data;
        this.totalPolls = data.count;
      });
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  onPageChange({
    pageSize,
    pageIndex,
  }: {
    pageIndex: number;
    pageSize: number;
  }): void {
    this.currentPage = pageIndex;
    this.pageSize = pageSize;
    this.loadPolls();
  }

  redirectToPoll(uuid: string): void {
    localStorage.setItem('pollUUID', uuid);
    this.router.navigate(['/heat-map-summary']);
  }

  ngOnInit(): void {
    this.loadCohortsList();
    this.checkScreenSize();
    this.cohortFormGroup.valueChanges.subscribe(formValue => {
      this.selectedCohort = this.cohortsData.filter(
        cohort => cohort.id === Number(formValue.cohortId)
      )[0];
      this.loadPolls();
    });
  }
}
