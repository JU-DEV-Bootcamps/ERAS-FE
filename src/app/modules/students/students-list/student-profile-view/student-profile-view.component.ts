import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import {
  STUDENT_INTERVENTION_MESSAGES,
  STUDENT_PROFILE_MESSAGES,
} from '@core/constants/messages';
import { StudentInterventionModel } from '@core/models/student-intervention.model';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { StudentInterventionService } from '@core/services/api/student-intervention.service';
import { StudentInterventionListComponent } from '../student-interventions/student-intervention-list/student-intervention-list.component';
import { StudentInterventionsComponent } from '../student-interventions/student-interventions.component';
import {
  STUDENT_PROFILE_SECTIONS,
  StudentProfileFieldDefinition,
} from './student-profile-sections';

/**
 * The student profile as both student modals show it: Personal information, Current academic information
 * and Interventions, from one shared definition. The profile summary uses `read` (two read-only lists);
 * the student record uses `manage` (the entries can be added, edited and deleted).
 */
@Component({
  selector: 'app-student-profile-view',
  imports: [
    MatIconModule,
    StudentInterventionListComponent,
    StudentInterventionsComponent,
  ],
  templateUrl: './student-profile-view.component.html',
  styleUrl: './student-profile-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileViewComponent implements OnInit {
  private readonly interventionService = inject(StudentInterventionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly profile = input.required<StudentProfileSummaryModel>();
  readonly studentId = input.required<number>();
  readonly interventionsMode = input<'read' | 'manage'>('read');

  readonly sections = STUDENT_PROFILE_SECTIONS;
  readonly messages = STUDENT_PROFILE_MESSAGES;
  readonly interventionMessages = STUDENT_INTERVENTION_MESSAGES;

  readonly entries = signal<StudentInterventionModel[]>([]);
  readonly entriesError = signal(false);
  readonly risks = computed(() =>
    this.entries().filter(entry => entry.kind === 'RiskIdentified')
  );
  readonly support = computed(() =>
    this.entries().filter(entry => entry.kind === 'SupportReceived')
  );

  ngOnInit(): void {
    if (this.interventionsMode() !== 'read') return;
    this.interventionService
      .getByStudent(this.studentId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: entries => this.entries.set(entries),
        error: () => this.entriesError.set(true),
      });
  }

  isVisible(field: StudentProfileFieldDefinition): boolean {
    return field.isVisible ? field.isVisible(this.profile()) : true;
  }

  /** Text for a value the BE may not provide yet. */
  display(field: StudentProfileFieldDefinition): string {
    const value = field.value?.(this.profile());
    return value === null || value === undefined || value === ''
      ? this.messages.NOT_AVAILABLE
      : String(value);
  }

  displayValue(value: string | null | undefined): string {
    return value ? value : this.messages.NOT_AVAILABLE;
  }
}
