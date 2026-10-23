import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { STUDENT_PROFILE_MESSAGES } from '@core/constants/messages';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { CohortService } from '@core/services/api/cohort.service';
import { StudentService } from '@core/services/api/student.service';
import { catchError, forkJoin, map, of } from 'rxjs';

export interface StudentProfileSummaryModalData {
  studentId: number;
}

@Component({
  selector: 'app-student-profile-summary-modal',
  imports: [MatDialogModule, MatIconModule, MatProgressSpinner],
  templateUrl: './student-profile-summary-modal.component.html',
  styleUrl: './student-profile-summary-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileSummaryModalComponent {
  private readonly studentService = inject(StudentService);
  private readonly cohortService = inject(CohortService);
  private readonly data =
    inject<StudentProfileSummaryModalData>(MAT_DIALOG_DATA);

  readonly messages = STUDENT_PROFILE_MESSAGES;
  readonly profile = signal<StudentProfileSummaryModel | null>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  constructor() {
    // The BE returns the student's current `cohortId`; the name is resolved from the cohort list.
    forkJoin({
      profile: this.studentService.getStudentProfileSummary(
        this.data.studentId
      ),
      cohorts: this.cohortService.getCohorts().pipe(
        map(response => response.body ?? []),
        catchError(() => of([]))
      ),
    })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: ({ profile, cohorts }) => {
          const cohortName =
            profile.cohortId == null
              ? profile.cohortName
              : (cohorts.find(
                  cohort => Number(cohort.id) === Number(profile.cohortId)
                )?.name ?? profile.cohortName);
          this.profile.set({ ...profile, cohortName });
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  fullName(profile: StudentProfileSummaryModel): string {
    return [profile.firstName, profile.middleName, profile.lastName]
      .filter(Boolean)
      .join(' ');
  }

  /** Text for a value the BE may not provide yet. */
  display(value: string | number | null | undefined): string {
    return value === null || value === undefined || value === ''
      ? this.messages.NOT_AVAILABLE
      : String(value);
  }
}
