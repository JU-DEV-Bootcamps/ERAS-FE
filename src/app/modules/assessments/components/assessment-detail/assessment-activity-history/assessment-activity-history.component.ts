import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';

import { ASSESSMENT_ACTIVITY_MESSAGES } from '@core/constants/messages';
import { AssessmentActivityModel } from '@core/models/assessment-activity.model';
import { AssessmentService } from '@core/services/api/assessement.service';

/** Read-only list of the events of an assessment, oldest first (the order the API returns). */
@Component({
  selector: 'app-assessment-activity-history',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assessment-activity-history.component.html',
  styleUrl: './assessment-activity-history.component.scss',
})
export class AssessmentActivityHistoryComponent {
  private readonly assessmentService = inject(AssessmentService);

  readonly assessmentId = input.required<number>();

  protected readonly messages = ASSESSMENT_ACTIVITY_MESSAGES;

  /** `null` while loading or when the request fails, so no empty message is shown by mistake. */
  protected readonly events = toSignal(
    toObservable(this.assessmentId).pipe(
      switchMap(assessmentId =>
        this.assessmentService
          .getActivity(assessmentId)
          .pipe(catchError(() => of(null)))
      )
    ),
    { initialValue: null as AssessmentActivityModel[] | null }
  );
}
