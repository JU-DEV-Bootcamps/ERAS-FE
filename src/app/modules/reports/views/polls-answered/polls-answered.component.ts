import { PollFiltersComponent } from '../../components/poll-filters/poll-filters.component';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { CohortModel } from '../../../../core/models/cohort.model';
import { TimestampToDatePipe } from '../../../../shared/pipes/timestamp-to-date.pipe';
import { PollModel } from '../../../../core/models/poll.model';
import { PollInstanceModel } from '../../../../core/models/poll-instance.model';
import { MatDialog } from '@angular/material/dialog';
import { ModalStudentDetailComponent } from '../../../../features/modal-student-detail/modal-student-detail.component';
import { EmptyDataComponent } from '../../../../shared/components/empty-data/empty-data.component';
import { PollService } from '../../../../core/services/api/poll.service';
import { PollInstanceService } from '../../../../core/services/api/poll-instance.service';
import { CohortService } from '../../../../core/services/api/cohort.service';
import { Column } from '../../../../shared/components/list/types/column';
import { ActionDatas } from '../../../../shared/components/list/types/action';
import { ListComponent } from '../../../../shared/components/list/list.component';
import { flattenArray } from '../../../../core/utilities/object/flatten';
import { EventAction, EventLoad } from '../../../../shared/events/load';
import { Filter } from '../../components/poll-filters/types/filters';

interface DynamicPollInstance
  extends PollInstanceModel,
    Record<string, unknown> {}

@Component({
  selector: 'app-polls-answered',
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
  selectedCohortIds: number[] = [];
  selectedPollUuid = '';

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
        page: event.pageIndex,
        pageSize: event.pageSize,
      })
      .subscribe(data => {
        this.pollInstances = flattenArray(
          data.body.items as unknown as Record<string, unknown>[]
        ) as DynamicPollInstance[];

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
      })
      .subscribe(data => {
        this.pollInstances = flattenArray(
          data.body.items as unknown as Record<string, unknown>[]
        ) as DynamicPollInstance[];

        this.totalPollInstances = data.body.count;
        this.loading = false;
      });
  }

  generateHeatMap(): void {
    const url = this.router
      .createUrlTree(['/heatmap-summary'], {
        queryParams: {
          cohortId: this.selectedCohortIds,
          pollUuid: this.selectedPollUuid,
        },
      })
      .toString();
    window.open(url, '_blank');
  }

  goToDetails(event: EventAction): void {
    const pollInstance: PollInstanceModel = event.item as PollInstanceModel;

    this.dialog.open(ModalStudentDetailComponent, {
      width: 'clamp(520px, 50vw, 980px)',
      maxWidth: '90vw',
      minHeight: '500px',
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
