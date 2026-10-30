import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';

import { STUDENT_INTERVENTION_MESSAGES } from '@core/constants/messages';
import {
  StudentInterventionKind,
  StudentInterventionModel,
} from '@core/models/student-intervention.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { StudentInterventionService } from '@core/services/api/student-intervention.service';
import { ERASPermissions } from '@core/services/permissions/permission.policies';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { ModalDeleteConfirmationService } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.service';
import { StudentInterventionFormModalComponent } from './student-intervention-form-modal/student-intervention-form-modal.component';
import { StudentInterventionListComponent } from './student-intervention-list/student-intervention-list.component';

/** Manages the risk-identified and support-received entries of one student inside the student record. */
@Component({
  selector: 'app-student-interventions',
  imports: [StudentInterventionListComponent],
  templateUrl: './student-interventions.component.html',
  styleUrl: './student-interventions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentInterventionsComponent implements OnInit {
  private readonly service = inject(StudentInterventionService);
  private readonly dialog = inject(MatDialog);
  private readonly deleteConfirmation = inject(ModalDeleteConfirmationService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly permissions = inject(PermissionsService);
  private readonly userData = inject(UserDataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly studentId = input.required<number>();

  readonly messages = STUDENT_INTERVENTION_MESSAGES;
  readonly entries = signal<StudentInterventionModel[]>([]);
  readonly risks = computed(() =>
    this.entries().filter(entry => entry.kind === 'RiskIdentified')
  );
  readonly support = computed(() =>
    this.entries().filter(entry => entry.kind === 'SupportReceived')
  );
  readonly canAdd = computed(() =>
    this.permissions.can(ERASPermissions.CAN_ADD_STUDENT_INTERVENTIONS)
  );

  /** An Administrator changes any entry; a Professional only the ones they created. */
  readonly canChange = (entry: StudentInterventionModel): boolean =>
    this.permissions.can(ERASPermissions.CAN_MANAGE_ANY_STUDENT_INTERVENTION) ||
    (this.permissions.can(ERASPermissions.CAN_ADD_STUDENT_INTERVENTIONS) &&
      entry.createdBy === this.userData.user()?.id);

  ngOnInit(): void {
    this.service
      .getByStudent(this.studentId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: entries => this.entries.set(entries),
        error: () =>
          this.toastService.showToast(
            {
              title: this.messages.SECTION_TITLE,
              message: this.messages.LOAD_ERROR,
              type: 'error',
            },
            true
          ),
      });
  }

  add(kind: StudentInterventionKind): void {
    this.openForm({ studentId: this.studentId(), kind });
  }

  edit(entry: StudentInterventionModel): void {
    this.openForm({ studentId: this.studentId(), kind: entry.kind, entry });
  }

  remove(entry: StudentInterventionModel): void {
    this.deleteConfirmation
      .confirmDelete({
        title: this.messages.DELETE_TITLE,
        subtitle: this.messages.DELETE_SUBTITLE,
        confirmText: this.messages.DELETE,
        cancelText: this.messages.CANCEL,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) this.deleteEntry(entry);
      });
  }

  private openForm(data: {
    studentId: number;
    kind: StudentInterventionKind;
    entry?: StudentInterventionModel;
  }): void {
    this.dialog
      .open(StudentInterventionFormModalComponent, {
        autoFocus: false,
        width: '586px',
        maxWidth: '95vw',
        data,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved?: StudentInterventionModel) => {
        if (saved) this.upsert(saved);
      });
  }

  private deleteEntry(entry: StudentInterventionModel): void {
    this.service
      .remove(this.studentId(), entry.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.entries.update(entries =>
            entries.filter(candidate => candidate.id !== entry.id)
          );
          this.toastService.showToast({
            title: this.messages.DELETE_TITLE,
            message: this.messages.DELETE_SUCCESS,
            type: 'success',
          });
        },
        error: () =>
          this.toastService.showToast(
            {
              title: this.messages.DELETE_TITLE,
              message: this.messages.DELETE_ERROR,
              type: 'error',
            },
            true
          ),
      });
  }

  /** Newest first, like the API: by date, then the most recently created. */
  private upsert(saved: StudentInterventionModel): void {
    this.entries.update(entries =>
      [...entries.filter(entry => entry.id !== saved.id), saved].sort(
        (left, right) =>
          right.entryDate.localeCompare(left.entryDate) || right.id - left.id
      )
    );
  }
}
