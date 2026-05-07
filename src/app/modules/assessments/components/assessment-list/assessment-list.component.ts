import { CommonModule, DatePipe, NgClass } from '@angular/common';
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
    this.deleteClicked.emit(item);
  }

  protected onMoreClick(item: AssessmentModel): void {
    this.moreClicked.emit(item);
  }

  loadAssessments(): void {
    this.isLoading.set(true);

    this.assessmentService.getAll().subscribe({
      next: data => {
        this.assessments.set(data.map(item => this.mapToRow(item)));
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
    return {
      ...item,
      studentDisplay: item.studentIds.length
        ? item.studentIds.join(', ')
        : 'No student assigned',
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
}
