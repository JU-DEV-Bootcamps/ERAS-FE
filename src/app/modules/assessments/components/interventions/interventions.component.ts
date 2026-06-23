import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  WritableSignal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AssessmentService } from '@core/services/api/assessement.service';
import {
  AssessmentModel,
  AssessmentStatus,
  InterventionModel,
  InterventionType,
} from '@core/models/assessement.model';
import { InterventionListComponent } from './interventions-list/intervention-list.component';
import { NewInterventionModalComponent } from './new-intervention-modal/new-intervention-modal.component';
import { StudentProfileData } from '../assessment-list/assessment-student-data/assessment-student-data.component';
import { ModalDeleteConfirmationComponent } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.component';
import { InterventionService } from '@core/services/api/intervention.service';
import { ListFiltersComponent } from '@shared/components/list-filters/list-filters.component';
import {
  AppliedFilter,
  FilterField,
  FilterName,
  FilterType,
} from '@shared/components/list-filters/models/list-filters.interface';
import {
  MultipleSelectItem,
  SingleSelectItem,
} from '@shared/components/form-field-virtual-scroll/interfaces/select';

@Component({
  selector: 'app-interventions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDialogModule,
    InterventionListComponent,
    ListFiltersComponent,
  ],
  templateUrl: './interventions.component.html',
  styleUrl: './interventions.component.scss',
})
export class InterventionsComponent implements OnInit {
  private readonly assessmentService = inject(AssessmentService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly matDialog = inject(MatDialog);

  private readonly interventionService = inject(InterventionService);

  readonly isLoadingAssessments: WritableSignal<boolean> = signal(false);
  private readonly allAssessments: WritableSignal<AssessmentModel[]> = signal(
    []
  );

  readonly studentNamesLookup: WritableSignal<
    Record<string, StudentProfileData>
  > = signal({});

  readonly selectedAssessmentId: WritableSignal<number | null> = signal(null);

  private readonly statusLabelMap: Record<AssessmentStatus, string> = {
    [AssessmentStatus.Created]: 'Created',
    [AssessmentStatus.InProgress]: 'In Progress',
    [AssessmentStatus.OnHold]: 'On Hold',
    [AssessmentStatus.Remitted]: 'Remitted',
    [AssessmentStatus.Resolved]: 'Resolved',
    [AssessmentStatus.Rejected]: 'Rejected',
  };

  private readonly assessmentOptions = signal<SingleSelectItem[]>([]);
  private readonly statusOptions = signal<MultipleSelectItem[]>([]);
  private readonly typeOptions = signal<MultipleSelectItem[]>([]);

  readonly appliedFilters = signal<AppliedFilter[]>([]);

  filters: FilterField[] = [];

  @ViewChild('interventionList') interventionList!: InterventionListComponent;

  ngOnInit(): void {
    this.loadAssessments();
    this._buildFiltersOptions();
    this.filters = [
      {
        name: FilterName.Assessment,
        disabled: false,
        label: 'Assessment',
        type: FilterType.virtualSelect,
        value: null,
        options: this.assessmentOptions(),
        validators: [Validators.required],
      },
      {
        name: FilterName.Type,
        disabled: false,
        label: 'Type',
        type: FilterType.virtualMultiSelect,
        value: null,
        options: this.typeOptions(),
        validators: [Validators.required],
      },
      {
        name: FilterName.Status,
        disabled: false,
        label: 'Status',
        type: FilterType.virtualMultiSelect,
        value: null,
        options: this.statusOptions(),
        validators: [Validators.required],
      },
    ];
  }

  handleFilters(filters: AppliedFilter[]) {
    const assessmentFilter = filters.find(
      filter => filter.name === FilterName.Assessment
    );
    if (assessmentFilter && assessmentFilter.value) {
      this.selectedAssessmentId.set(assessmentFilter.value as number);
    }

    this.appliedFilters.set(filters);
  }

  private loadAssessments(): void {
    this.isLoadingAssessments.set(true);

    this.assessmentService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: assessments => {
          this.allAssessments.set(assessments);
          this.isLoadingAssessments.set(false);

          const lookup: Record<string, StudentProfileData> = {};
          assessments.forEach(a => {
            a.studentIds.forEach((id, index) => {
              lookup[id] = a.students?.[index] ?? {
                id: 0,
                name: '',
                email: '',
              };
            });
          });
          this.studentNamesLookup.set(lookup);
        },
        error: err => {
          console.error('Failed to load assessments', err);
          this.isLoadingAssessments.set(false);
        },
      });
  }

  private _buildFiltersOptions() {
    this.assessmentOptions.set(this._mapAssessments());
    this.statusOptions.set(this._mapStatus());
    this.typeOptions.set(this._mapTypes());
  }

  private _mapAssessments(): SingleSelectItem[] {
    return this.allAssessments().map(assessment => {
      const date = new Date(assessment.createdAtUtc);
      const dateStr = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
      const statusLabel =
        this.statusLabelMap[assessment.status] ?? assessment.status;
      return {
        value: assessment.id!,
        label: `${dateStr} – ${assessment.service} (${statusLabel})`,
      };
    });
  }

  private _mapStatus(): MultipleSelectItem[] {
    const statusKeys: AssessmentStatus[] = Object.keys(
      this.statusLabelMap
    ) as AssessmentStatus[];
    const interventionStatus = statusKeys.filter(
      statusKey => statusKey !== AssessmentStatus.Rejected
    );
    return interventionStatus.map(statusKey => {
      return {
        label: this.statusLabelMap[statusKey as AssessmentStatus],
        value: statusKey,
      };
    });
  }

  private _mapTypes(): MultipleSelectItem[] {
    return [
      {
        label: InterventionType.Group,
        value: InterventionType.Group,
      },
      {
        label: InterventionType.Individual,
        value: InterventionType.Individual,
      },
    ];
  }

  onAssessmentChange(assessmentId: number | null): void {
    this.selectedAssessmentId.set(assessmentId);
  }

  openCreateModal(): void {
    if (this.selectedAssessmentId() == null) return;

    const assessment = this.allAssessments().find(
      a => a.id === this.selectedAssessmentId()
    );
    if (!assessment) return;

    const students = assessment.studentIds.map((id, index) => ({
      value: id,
      label: assessment.students?.[index].name ?? id,
    }));

    this.matDialog
      .open(NewInterventionModalComponent, {
        width: '520px',
        disableClose: true,
        data: {
          assessmentId: assessment.id!,
          professional: {
            value: assessment.assignedProfessional ?? '',
            label: assessment.assignedProfessional ?? '',
          },
          students,
        },
      })
      .afterClosed()
      .subscribe((created: boolean) => {
        if (created) {
          this.interventionList.loadInterventions(this.selectedAssessmentId()!);
        }
      });
  }

  openEditModal(intervention: InterventionModel): void {
    if (this.selectedAssessmentId() == null) return;
    const assessment = this.allAssessments().find(
      a => a.id === this.selectedAssessmentId()
    );
    if (!assessment) return;

    const students = assessment.studentIds.map((id, index) => ({
      value: id,
      label: assessment.students?.[index]?.name ?? String(id),
    }));

    this.matDialog
      .open(NewInterventionModalComponent, {
        width: '520px',
        disableClose: true,
        data: {
          assessmentId: assessment.id!,
          professional: {
            value: assessment.assignedProfessional ?? '',
            label: assessment.assignedProfessional ?? '',
          },
          students,
          intervention,
        },
      })
      .afterClosed()
      .subscribe((updated: boolean) => {
        if (updated)
          this.interventionList.loadInterventions(this.selectedAssessmentId()!);
      });
  }

  confirmDelete(intervention: InterventionModel): void {
    const assessmentId = this.selectedAssessmentId();
    if (assessmentId == null) return;

    this.matDialog
      .open(ModalDeleteConfirmationComponent, {
        width: '400px',
        data: {
          title: 'Delete Intervention',
          subtitle:
            'This will permanently remove the intervention and all its attachments.',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;
        this.interventionService
          .deleteIntervention(assessmentId, intervention.id!)
          .subscribe({
            next: () => this.interventionList.loadInterventions(assessmentId),
            error: err => console.error('Failed to delete intervention', err),
          });
      });
  }
}
