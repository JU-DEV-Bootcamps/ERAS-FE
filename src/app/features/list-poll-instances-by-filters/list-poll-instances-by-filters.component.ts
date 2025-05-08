import { NgFor } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { CohortModel } from '../../core/models/cohort.model';
import { TimestampToDatePipe } from '../../shared/pipes/timestamp-to-date.pipe';
import { PollModel } from '../../core/models/poll.model';
import { PollInstanceModel } from '../../core/models/poll-instance.model';
import { MatDialog } from '@angular/material/dialog';
import { ModalStudentDetailComponent } from '../modal-student-detail/modal-student-detail.component';
import { EmptyDataComponent } from '../../shared/components/empty-data/empty-data.component';
import { PollService } from '../../core/services/api/poll.service';
import { PollInstanceService } from '../../core/services/api/poll-instance.service';
import { CohortService } from '../../core/services/api/cohort.service';
import { Column } from '../../shared/components/list/types/column';
import { ActionDatas } from '../../shared/components/list/types/action';
import { ListComponent } from '../../shared/components/list/list.component';
import { flattenArray } from '../../core/utilities/object/flatten';

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
interface DynamicPollInstance extends PollInstanceModel {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

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
    EmptyDataComponent,
    ListComponent,
  ],
  templateUrl: './list-poll-instances-by-filters.component.html',
  styleUrl: './list-poll-instances-by-filters.component.scss',
})
export class ListPollInstancesByFiltersComponent implements OnInit {
  private readonly router = inject(Router);
  readonly dialog = inject(MatDialog);

  transformPipe = new TimestampToDatePipe();
  columns: Column<DynamicPollInstance>[] = [
    {
      label: 'Uuid',
      key: 'student.uuid',
    },
    {
      label: 'Finished At',
      key: 'finishedAt',
      pipe: this.transformPipe,
    },
    {
      label: 'Student Name',
      key: 'student.name',
    },
    {
      label: 'Student Email',
      key: 'student.email',
    },
    {
      label: 'Modified At',
      key: 'student.audit.modifiedAt',
      pipe: this.transformPipe,
    },
  ];

  pollService = inject(PollService);
  pollInstanceService = inject(PollInstanceService);
  cohortService = inject(CohortService);

  loading = false;
  data = new MatTableDataSource<PollInstanceModel>([]);
  pollInstances: DynamicPollInstance[] = [];
  totalPollInstances = 0;

  cohortsData: CohortModel[] = [];
  actionDatas: ActionDatas = [
    {
      columnId: 'actions',
      label: 'Actions',
      ngIconName: 'assignment',
    },
  ];
  polls: PollModel[] = [];
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
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  loadCohortsList(): void {
    this.cohortService.getCohorts().subscribe(data => {
      const defaultOpt: CohortModel = {
        name: 'All Cohorts',
        courseCode: '',
        audit: {
          createdBy: '',
          modifiedBy: '',
          createdAt: new Date(),
          modifiedAt: new Date(),
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
    this.loading = true;
    this.pollInstanceService
      .getPollInstancesByFilters(cohortId, 400)
      .subscribe(data => {
        this.data = new MatTableDataSource<PollInstanceModel>(
          data.body.filter(p => p.uuid == this.selectedPollUuid)
        );
        this.pollInstances = flattenArray(
          data.body as unknown as Record<string, unknown>[]
        ) as DynamicPollInstance[];
        this.totalPollInstances = this.pollInstances.length;
        this.loading = false;
      });
  }

  onSelectionChange() {
    if (this.filtersForm.invalid) return;
    if (
      this.filtersForm.value.selectedCohort &&
      this.filtersForm.value.selectedPoll
    ) {
      this.loading = true;
      this.loadPollInstances(this.filtersForm.value.selectedCohort);
    }
  }

  generateHeatMap(): void {
    const url = this.router
      .createUrlTree(['/heatmap-summary'], {
        queryParams: {
          cohortId: this.filtersForm.value.selectedCohort,
          pollUuid: this.filtersForm.value.selectedPoll,
        },
      })
      .toString();
    window.open(url, '_blank');
  }

  goToDetails(pollInstance: PollInstanceModel): void {
    this.dialog.open(ModalStudentDetailComponent, {
      width: 'clamp(520px, 50vw, 980px)',
      maxWidth: '90vw',
      minHeight: '500px',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: { studentId: pollInstance.student.id },
    });
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
