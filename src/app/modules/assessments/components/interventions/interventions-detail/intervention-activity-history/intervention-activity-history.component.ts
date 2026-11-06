import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, of, switchMap } from 'rxjs';

import { INTERVENTION_ACTIVITY_MESSAGES } from '@core/constants/messages';
import { InterventionActivityModel } from '@core/models/intervention-activity.model';
import { InterventionService } from '@core/services/api/intervention.service';

/** Read-only list of the events of an intervention, oldest first (the order the API returns). */
@Component({
  selector: 'app-intervention-activity-history',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './intervention-activity-history.component.html',
  styleUrl: './intervention-activity-history.component.scss',
})
export class InterventionActivityHistoryComponent {
  private readonly interventionService = inject(InterventionService);

  readonly assessmentId = input.required<number>();
  readonly interventionId = input.required<number>();

  protected readonly messages = INTERVENTION_ACTIVITY_MESSAGES;

  /** `null` while loading or when the request fails, so no empty message is shown by mistake. */
  protected readonly events = toSignal(
    combineLatest([
      toObservable(this.assessmentId),
      toObservable(this.interventionId),
    ]).pipe(
      switchMap(([assessmentId, interventionId]) =>
        this.interventionService
          .getActivity(assessmentId, interventionId)
          .pipe(catchError(() => of(null)))
      )
    ),
    { initialValue: null as InterventionActivityModel[] | null }
  );
}
