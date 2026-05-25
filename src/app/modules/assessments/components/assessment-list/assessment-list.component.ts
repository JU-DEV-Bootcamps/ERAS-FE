import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AssessmentStatusBadgeComponent } from './assessment-status-badge/assessment-status-badge.component';
import { AssessmentDetailDialogComponent } from '../assessment-detail/assessment-detail-dialog.component';
import {
  AssessmentModel,
  AssessmentStatus,
} from '../../../../core/models/assessement.model';
import { AssessmentService } from '../../../../core/services/api/assessement.service';
import { MatDialog } from '@angular/material/dialog';
import { NewInterventionModalComponent } from '../interventions/new-intervention-modal/new-intervention-modal.component';
import { ModalDeleteConfirmationService } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastNotificationData } from '@core/models/toast-notification.model';
import { ToastNotificationService } from '@core/services/toast-notification.service';

export interface AssessmentRowViewModel extends AssessmentModel {
  studentDisplay: string;
  commentPreview: string;
  isEditable: boolean;
}

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    AssessmentStatusBadgeComponent,
    AssessmentDetailDialogComponent,
  ],
  templateUrl: './assessment-list.component.html',
  styleUrl: './assessment-list.component.scss',
})
export class AssessmentListComponent implements OnInit {
  private readonly assessmentService = inject(AssessmentService);
  private readonly matDialog = inject(MatDialog);
  private readonly modalDeleteService = inject(ModalDeleteConfirmationService);
  private readonly toastService = inject(ToastNotificationService);

  @Input() pageSize = 10;

  @Output() createClicked = new EventEmitter<void>();
  @Output() viewClicked = new EventEmitter<AssessmentModel>();
  @Output() editClicked = new EventEmitter<AssessmentModel>();
  @Output() deleteClicked = new EventEmitter<AssessmentModel>();
  @Output() moreClicked = new EventEmitter<AssessmentModel>();

  protected readonly displayedColumns = [
    'date',
    'submitter',
    'service',
    'professional',
    'student',
    'status',
    'comment',
    'actions',
  ];

  protected readonly isLoading = signal(true);
  lookupsLoading = input<boolean>(true);

  protected readonly pageIndex = signal(0);
  protected readonly assessments = signal<AssessmentRowViewModel[]>([]);
  protected readonly selectedAssessment = signal<AssessmentRowViewModel | null>(
    null
  );

  protected readonly pagedAssessments = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    const end = start + this.pageSize;
    return this.assessments().slice(start, end);
  });

  ngOnInit(): void {
    this.loadAssessments();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
  }

  protected onCreateClick(): void {
    this.createClicked.emit();
  }

  protected onViewClick(item: AssessmentRowViewModel): void {
    this.viewClicked.emit(item);
    this.selectedAssessment.set(item);
  }

  protected closeDetailPanel(): void {
    this.selectedAssessment.set(null);
  }

  protected onEditClick(item: AssessmentModel): void {
    this.editClicked.emit(item);
  }

  protected onDeleteClick(item: AssessmentModel): void {
    if (item.id === undefined) return;

    this.modalDeleteService
      .confirmDelete({
        title: 'Delete assessment',
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.isLoading.set(true);
        this.assessmentService.deleteAssessment(item.id!).subscribe({
          next: () => {
            this.deleteClicked.emit(item);
            const toastData = this.buildSuccessToastDataObject(item);
            this.toastService.showToast(toastData);
            this.assessmentService.clearCache();
            this.loadAssessments();
          },
          error: error => {
            const toastData = this.buildErrorToastDataObject(item, error);
            this.toastService.showToast(toastData, true);
            console.error('Failed to remove one assessment', error);
            this.isLoading.set(false);
          },
        });
      });
  }

  protected onMoreClick(item: AssessmentModel): void {
    this.moreClicked.emit(item);
  }

  protected onCreateIntervention(assessment: AssessmentRowViewModel): void {
    const students = assessment.studentIds.map((id, index) => ({
      value: String(id),
      label: assessment.studentNames?.[index] ?? String(id),
    }));

    this.matDialog.open(NewInterventionModalComponent, {
      width: '520px',
      disableClose: true,
      data: {
        assessmentId: assessment.id,
        professional: {
          value: assessment.assignedProfessional ?? '',
          label: assessment.assignedProfessional ?? '',
        },
        students,
      },
    });
  }

  loadAssessments(): void {
    this.isLoading.set(true);

    this.assessmentService.getAll().subscribe({
      next: data => {
        this.assessments.set(data.map(item => this.mapToRow(item)));
        const maxPage = Math.max(
          0,
          Math.ceil(this.assessments().length / this.pageSize) - 1
        );
        if (this.pageIndex() > maxPage) {
          this.pageIndex.set(maxPage);
        }
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Failed to load assessments', error);
        this.assessments.set([]);
        this.isLoading.set(false);
      },
    });
  }

  private mapToRow(item: AssessmentModel): AssessmentRowViewModel {
    const display = item.studentNames?.length
      ? item.studentNames.join(', ')
      : item.studentIds?.length
        ? item.studentIds.join(', ')
        : 'No student assigned';

    return {
      ...item,
      studentDisplay: display,
      commentPreview: this.buildCommentPreview(item.comments),
      isEditable: this.isItemEditable(item.status),
    };
  }

  private buildCommentPreview(comments?: string | null): string {
    if (!comments?.trim()) {
      return '—';
    }
    return comments.length > 60
      ? `${comments.slice(0, 60).trim()}...`
      : comments;
  }

  private isItemEditable(itemStatus: AssessmentStatus) {
    const editableStatus = [AssessmentStatus.Created, AssessmentStatus.OnHold];

    return !!editableStatus.find(status => itemStatus === status);
  }

  private buildSuccessToastDataObject(
    item: AssessmentModel
  ): ToastNotificationData {
    return {
      title: 'Assessment removed successfully',
      message: `Assessment with id: ${item.id} was removed`,
      type: 'success',
    };
  }

  private buildErrorToastDataObject(
    item: AssessmentModel,
    error: HttpErrorResponse
  ): ToastNotificationData {
    const message =
      item.status === 'Remitted'
        ? `The item with id: ${item.id} cannot be removed due to its status.`
        : `${error.statusText}: The item was not found with id: ${item.id}`;
    return {
      title: 'Assessment removed failed',
      message: message,
      type: 'error',
    };
  }
}
