import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { STUDENT_PROFILE_MESSAGES } from '@core/constants/messages';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { CohortService } from '@core/services/api/cohort.service';
import { StudentService } from '@core/services/api/student.service';
import { StudentProfileViewComponent } from '../student-profile-view/student-profile-view.component';
import { withCohortName } from '../student-profile-view/student-profile-sections';
import { catchError, forkJoin, map, of } from 'rxjs';

export interface StudentProfileSummaryModalData {
  studentId: number;
}

@Component({
  selector: 'app-student-profile-summary-modal',
  imports: [MatDialogModule, MatProgressSpinner, StudentProfileViewComponent],
  templateUrl: './student-profile-summary-modal.component.html',
  styleUrl: './student-profile-summary-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileSummaryModalComponent {
  private readonly studentService = inject(StudentService);
  private readonly cohortService = inject(CohortService);
  readonly data = inject<StudentProfileSummaryModalData>(MAT_DIALOG_DATA);

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
          this.profile.set(withCohortName(profile, cohorts));
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
