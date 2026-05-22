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
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AssessmentService } from '@core/services/api/assessement.service';
import {
  AssessmentModel,
  AssessmentStatus,
} from '@core/models/assessement.model';
import { InterventionListComponent } from './interventions-list/intervention-list.component';
import { NewInterventionModalComponent } from './new-intervention-modal/new-intervention-modal.component';

interface AssessmentOption {
  value: number;
  label: string;
}

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
  ],
  templateUrl: './interventions.component.html',
  styleUrl: './interventions.component.scss',
})
export class InterventionsComponent implements OnInit {
  private readonly assessmentService = inject(AssessmentService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly matDialog = inject(MatDialog);

  readonly isLoadingAssessments: WritableSignal<boolean> = signal(false);
  readonly assessmentOptions: WritableSignal<AssessmentOption[]> = signal([]);
  private readonly allAssessments: WritableSignal<AssessmentModel[]> = signal(
    []
  );

  readonly studentNamesLookup: WritableSignal<Record<string, string>> = signal(
    {}
  );

  readonly selectedAssessmentId: WritableSignal<number | null> = signal(null);

  private readonly statusLabelMap: Record<AssessmentStatus, string> = {
    [AssessmentStatus.Created]: 'Created',
    [AssessmentStatus.InProgress]: 'In Progress',
    [AssessmentStatus.OnHold]: 'On Hold',
    [AssessmentStatus.Remitted]: 'Remitted',
    [AssessmentStatus.Resolved]: 'Resolved',
    [AssessmentStatus.Rejected]: 'Rejected',
  };

  @ViewChild('interventionList') interventionList!: InterventionListComponent;

  ngOnInit(): void {
    this.loadAssessments();
  }

  private loadAssessments(): void {
    this.isLoadingAssessments.set(true);

    this.assessmentService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: assessments => {
          this.allAssessments.set(assessments);
          this.assessmentOptions.set(assessments.map(a => this.mapToOption(a)));
          this.isLoadingAssessments.set(false);

          const lookup: Record<string, string> = {};
          assessments.forEach(a => {
            a.studentIds.forEach((id, index) => {
              lookup[id] = a.studentNames?.[index] ?? id;
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

  private mapToOption(a: AssessmentModel): AssessmentOption {
    const date = new Date(a.createdAtUtc);
    const dateStr = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    const statusLabel = this.statusLabelMap[a.status] ?? a.status;
    return {
      value: a.id!,
      label: `${dateStr} – ${a.service} (${statusLabel})`,
    };
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
      label: assessment.studentNames?.[index] ?? id,
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
}
