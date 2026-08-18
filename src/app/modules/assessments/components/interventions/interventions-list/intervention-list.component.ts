import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  input,
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
import {
  AssessmentModel,
  InterventionModel,
  RiskLevels,
} from '@core/models/assessment.model';
import { InterventionService } from '@core/services/api/intervention.service';
import {
  StudentProfileData,
  AssessmentStudentDataComponent,
} from '../../assessment-list/assessment-student-data/assessment-student-data.component';
import { AppliedFilter } from '@shared/components/list-filters/models/list-filters.interface';
import { InterventionFilterStrategy } from '@shared/components/list-filters/strategies/interventions.strategy';
import { AssessmentService } from '@core/services/api/assessement.service';

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
  private readonly assessmentService = inject(AssessmentService);
  private readonly filterStrategy = inject(InterventionFilterStrategy);

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
      this.loadAssessment(value);
      this.sortColumn.set(null);
    } else {
      this.interventions.set([]);
      this.assessment.set(null);
    }
  }

  protected readonly assessment = signal<AssessmentModel | null>(null);
  protected readonly isLoadingAssessment = signal(false);

  readonly appliedFilters = input<AppliedFilter[]>([]);

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
    'risk',
    'endRisk',
    'status',
    'comment',
    'actions',
  ];

  protected readonly isLoading = signal(false);
  protected readonly pageIndex = signal(0);
  protected readonly interventions = signal<InterventionRowViewModel[]>([]);
  protected readonly selectedIntervention =
    signal<InterventionRowViewModel | null>(null);

  protected readonly sortColumn = signal<string | null>(null);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');

  private readonly riskRank: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  protected readonly pagedInterventions = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    const end = start + this.pageSize;
    return this.sortedInterventions().slice(start, end);
  });

  protected readonly sortedInterventions = computed(() => {
    const rows = this.filteredInterventions();
    const column = this.sortColumn();
    const direction = this.sortDirection();
    if (!column) return rows;

    const sorted = [...rows].sort((a, b) => {
      const cmp = this.compareByColumn(a, b, column);
      return direction === 'asc' ? cmp : -cmp;
    });
    return sorted;
  });

  private compareByColumn(
    a: InterventionRowViewModel,
    b: InterventionRowViewModel,
    column: string
  ): number {
    if (column === 'risk') {
      const rankA = this.riskRank[a.riskLevelName!.toLowerCase()] ?? 0;
      const rankB = this.riskRank[b.riskLevelName!.toLowerCase()] ?? 0;
      return rankA - rankB;
    }
    return 0;
  }

  protected readonly filteredInterventions = computed(() => {
    const filters = this.appliedFilters();
    const filteredInterventionModels = this.filterStrategy.apply(
      this.interventions(),
      filters
    );
    return filteredInterventionModels.map(intervention =>
      this.mapToRow(intervention)
    );
  });

  protected readonly hasInterventions = signal(false);

  get statusFinalizedAssessment(): boolean {
    return this.assessment()?.status === 'Finalized';
  }

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
        const rows = data.map(item => this.mapToRow(item));
        this.hasInterventions.set(rows.length > 0);
        this.interventions.set(rows);

        const current = this.selectedIntervention();
        if (current) {
          const refreshed = rows.find(r => r.id === current.id);
          this.selectedIntervention.set(refreshed ?? null);
        }

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
      endRiskLevelName: item.endRiskLevelName ?? RiskLevels.None,
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

  private loadAssessment(assessmentId: number): void {
    this.isLoadingAssessment.set(true);

    this.assessmentService.getById(assessmentId.toString()).subscribe({
      next: data => {
        this.assessment.set(data);
        this.isLoadingAssessment.set(false);
      },
      error: error => {
        console.error('Failed to load assessment', error);
        this.assessment.set(null);
        this.isLoadingAssessment.set(false);
      },
    });
  }

  protected onSortClick(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.pageIndex.set(0);
  }
}
