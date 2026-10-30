import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { STUDENT_INTERVENTION_MESSAGES } from '@core/constants/messages';
import { STUDENT_INTERVENTION_TYPE_LABELS } from '@core/constants/student-intervention.constants';
import { StudentInterventionModel } from '@core/models/student-intervention.model';

/**
 * Entries of one kind, shared by the managing section and the read-only profile summary so both
 * render them the same way. Descriptions are interpolated, so they are always shown as plain text.
 */
@Component({
  selector: 'app-student-intervention-list',
  imports: [DatePipe, MatIconModule],
  templateUrl: './student-intervention-list.component.html',
  styleUrl: './student-intervention-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentInterventionListComponent {
  readonly entries = input.required<StudentInterventionModel[]>();
  readonly emptyText = input.required<string>();
  /** Which entries show the edit and delete actions; none by default (read only). */
  readonly canChange = input<(entry: StudentInterventionModel) => boolean>(
    () => false
  );

  readonly editEntry = output<StudentInterventionModel>();
  readonly deleteEntry = output<StudentInterventionModel>();

  readonly messages = STUDENT_INTERVENTION_MESSAGES;

  typeLabel(entry: StudentInterventionModel): string {
    return STUDENT_INTERVENTION_TYPE_LABELS[entry.type];
  }

  testId(entry: StudentInterventionModel): string {
    return entry.kind === 'RiskIdentified' ? 'risk-entry' : 'support-entry';
  }
}
