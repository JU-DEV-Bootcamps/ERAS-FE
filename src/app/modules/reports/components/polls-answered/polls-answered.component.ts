import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { Router } from '@angular/router';

import { ActionDatas } from '@shared/components/list/types/action';
import { CohortModel } from '@core/models/cohort.model';
import { Column } from '@shared/components/list/types/column';
import { EventAction, EventLoad } from '@core/models/load';
import { Filter } from '../../components/poll-filters/types/filters';
import { PollInstanceModel } from '@core/models/poll-instance.model';
import { PollModel } from '@core/models/poll.model';

import { flattenArray } from '@core/utils/helpers/flatten';
import { sortArray } from '@core/utils/helpers/sort';
import { TimestampToDatePipe } from '@shared/pipes/timestamp-to-date.pipe';

import { CohortService } from '@core/services/api/cohort.service';
import { PollInstanceService } from '@core/services/api/poll-instance.service';
import { PollService } from '@core/services/api/poll.service';

import { EmptyDataComponent } from '@shared/components/empty-data/empty-data.component';
import { ListComponent } from '@shared/components/list/list.component';
import { ModalStudentDetailComponent } from '../../../../shared/components/modals/modal-student-detail/modal-student-detail.component';
import { PollFiltersComponent } from '../../components/poll-filters/poll-filters.component';

interface DynamicPollInstance
  extends PollInstanceModel,
    Record<string, unknown> {}

@Component({
  selector: 'app-polls-answered',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
    EmptyDataComponent,
    ListComponent,
    PollFiltersComponent,
  ],
  templateUrl: './polls-answered.component.html',
  styleUrl: './polls-answered.component.scss',
})
export class PollsAnsweredComponent implements OnInit {
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
      pipeKey: 'finishedAt',
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
      pipeKey: 'student.audit.modifiedAt',
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
      id: 'seeStudentDetails',
      columnId: 'actions',
      label: 'Actions',
      ngIconName: 'assignment',
      tooltip: 'See student details',
    },
  ];
  polls: PollModel[] = [];
  selectedCohortIds: number[] = [];
  selectedPollUuid = '';
  lastVersion = true;

  pageSize = 10;
  currentPage = 0;

  isMobile = false;

  ngOnInit(): void {
    this.loadCohortsList();
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  loadCohortsList(): void {
    this.cohortService
      .getCohorts(this.selectedPollUuid, this.lastVersion)
      .subscribe(data => {
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
        this.cohortsData = data.body;
        this.cohortsData.push(defaultOpt);
      });
  }

  getPollsByCohortId(id: number) {
    this.pollService.getPollsByCohortId(id).subscribe(data => {
      this.polls = data;
    });
  }

  loadPollInstances(event: EventLoad): void {
    this.pollInstanceService
      .getPollInstancesByFilters({
        cohortIds: this.selectedCohortIds,
        page: event.page,
        pageSize: event.pageSize,
        lastVersion: this.lastVersion,
        pollUuid: this.selectedPollUuid,
      })
      .subscribe(data => {
        const flatedArray = flattenArray(
          data.body.items as unknown as Record<string, unknown>[]
        ) as DynamicPollInstance[];

        //TODO: Remove this workaround, once we have implemented order by column on the table.
        this.pollInstances = sortArray(flatedArray, 'student.name');

        this.totalPollInstances = data.body.count;
      });
  }

  load(): void {
    this.loading = true;
    this.pollInstanceService
      .getPollInstancesByFilters({
        cohortIds: this.selectedCohortIds,
        page: 0,
        pageSize: 10,
        lastVersion: this.lastVersion,
        pollUuid: this.selectedPollUuid,
      })
      .subscribe(data => {
        const flatedArray = flattenArray(
          data.body.items as unknown as Record<string, unknown>[]
        ) as DynamicPollInstance[];

        //TODO: Remove this workaround, once we have implemented order by column on the table.
        this.pollInstances = sortArray(flatedArray, 'student.name');

        this.totalPollInstances = data.body.count;
        this.loading = false;
      });
  }

  goToDetails(event: EventAction): void {
    const pollInstance: PollInstanceModel = event.item as PollInstanceModel;

    this.dialog.open(ModalStudentDetailComponent, {
      width: 'clamp(520px, 50vw, 980px)',
      maxWidth: '90vw',
      maxHeight: '60vh',
      panelClass: 'border-modalbox-dialog',
      data: {
        studentId: pollInstance['student.id' as keyof PollInstanceModel],
      },
    });
  }

  handleFilterSelect(filters: Filter) {
    this.selectedPollUuid = filters.uuid;
    this.selectedCohortIds = filters.cohortIds;
    this.lastVersion = filters.lastVersion;
    this.loading = true;
    this.load();
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
