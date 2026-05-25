import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { InterventionPillBadgeComponent } from './intervention-status-badge/intervention-pill-badge.component';
import { InterventionDetailComponent } from '../interventions-detail/intervention-detail.component';
import { InterventionModel } from '@core/models/assessement.model';
import { InterventionService } from '@core/services/api/intervention.service';
import {
  StudentProfileData,
  AssessmentStudentDataComponent,
} from '../../assessment-list/assessment-student-data/assessment-student-data.component';

export interface InterventionRowViewModel extends InterventionModel {
  studentDisplay: StudentProfileData[] | string;
  commentPreview: string;
}

@Component({
  selector: 'app-intervention-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    InterventionPillBadgeComponent,
    InterventionDetailComponent,
    AssessmentStudentDataComponent,
  ],
  templateUrl: './intervention-list.component.html',
  styleUrl: './intervention-list.component.scss',
})
export class InterventionListComponent {
  private readonly interventionService = inject(InterventionService);

  @Input() pageSize = 10;

  @Input() set studentNamesLookup(value: Record<string, StudentProfileData>) {
    this._studentNamesLookup = value;
  }
  private _studentNamesLookup: Record<string, StudentProfileData> = {};

  readonly assessmentId = signal<number | null>(null);
  @Input() set assessmentIdInput(value: number | null) {
    this.assessmentId.set(value);
    if (value != null) {
      this.loadInterventions(value);
    } else {
      this.interventions.set([]);
    }
  }

  @Output() createClicked = new EventEmitter<void>();
  @Output() editClicked = new EventEmitter<InterventionModel>();
  @Output() deleteClicked = new EventEmitter<InterventionModel>();

  protected readonly displayedColumns = [
    'date',
    'type',
    'mode',
    'activity',
    'professional',
    'student',
    'area',
    'status',
    'comment',
    'actions',
  ];

  protected readonly isLoading = signal(false);
  protected readonly pageIndex = signal(0);
  protected readonly interventions = signal<InterventionRowViewModel[]>([]);
  protected readonly selectedIntervention =
    signal<InterventionRowViewModel | null>(null);

  private _assessmentId: number | null = null;

  protected readonly pagedInterventions = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    const end = start + this.pageSize;
    return this.interventions().slice(start, end);
  });

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
  }

  protected onCreateClick(): void {
    this.createClicked.emit();
  }

  protected onViewClick(item: InterventionRowViewModel): void {
    this.selectedIntervention.set(item);
  }

  protected closeDetailPanel(): void {
    this.selectedIntervention.set(null);
  }

  protected onEditClick(item: InterventionModel): void {
    this.editClicked.emit(item);
  }

  protected onDeleteClick(item: InterventionModel): void {
    this.deleteClicked.emit(item);
  }

  loadInterventions(assessmentId: number): void {
    this.isLoading.set(true);
    this.pageIndex.set(0);

    this.interventionService.getByAssessment(assessmentId).subscribe({
      next: data => {
        this.interventions.set(data.map(item => this.mapToRow(item)));
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Failed to load interventions', error);
        this.interventions.set([]);
        this.isLoading.set(false);
      },
    });
  }

  private mapToRow(item: InterventionModel): InterventionRowViewModel {
    return {
      ...item,
      studentDisplay: this.buildStudentDisplay(item),
      commentPreview: this.buildCommentPreview(item.comments),
    };
  }

  private buildStudentDisplay(
    item: InterventionModel
  ): StudentProfileData[] | string {
    if (item.studentIds?.length) {
      return item.studentIds.map(id => this._studentNamesLookup[id]);
    }
    return 'No student assigned';
  }

  private buildCommentPreview(comments?: string | null): string {
    if (!comments?.trim()) return '—';
    return comments.length > 60
      ? `${comments.slice(0, 60).trim()}...`
      : comments;
  }
}
