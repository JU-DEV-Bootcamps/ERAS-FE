import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { BehaviorSubject, forkJoin, timer } from 'rxjs';
import { switchMap, takeWhile, tap } from 'rxjs/operators';

import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { EventAction } from '@core/models/load';
import {
  IMPORT_ACTIVE_STATUSES,
  ImportItemRow,
  ImportJobItem,
  ImportJobStatus,
  ImportJobStatusModel,
} from '@core/models/import-job.model';
import {
  isFieldEmailValid,
  isFieldNameValid,
} from '@core/utils/validators/fields.util';
import { TableWithActionsComponent } from '@shared/components/table-with-actions/table-with-actions.component';
import { Column } from '@shared/components/list/types/column';
import { ActionDatas } from '@shared/components/list/types/action';

import { ImportStatusBadgeComponent } from './import-status-badge/import-status-badge.component';

const POLL_INTERVAL_MS = 3000;

@Component({
  selector: 'app-import-status',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TableWithActionsComponent,
    ImportStatusBadgeComponent,
  ],
  templateUrl: './import-status.component.html',
  styleUrl: './import-status.component.scss',
})
export class ImportStatusComponent implements OnInit {
  private readonly clService = inject(CosmicLatteService);
  private readonly toast = inject(ToastNotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('statusTpl', { static: true })
  statusTpl!: TemplateRef<unknown>;

  readonly importJobId = Number(
    this.route.snapshot.paramMap.get('importJobId')
  );

  status: ImportJobStatusModel | null = null;
  rows: ImportItemRow[] = [];

  readonly columns: Column<ImportItemRow>[] = [
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Cohort', key: 'cohort' },
  ];
  readonly statusColumns: Column<ImportItemRow>[] = [
    { label: 'Status', key: 'status' },
  ];
  readonly actions: ActionDatas = [
    {
      id: 'retry',
      columnId: 'actions',
      label: 'Retry',
      ngIconName: 'refresh',
      tooltip: 'Retry this student',
      isVisible: (item: unknown) => (item as ImportItemRow).status === 'Failed',
    },
  ];
  templateMap = new Map<string, TemplateRef<unknown>>();

  // Selection target depends on the phase: extracted respondents (to confirm) vs failed items (to retry).
  readonly isItemDisabled = (row: ImportItemRow) =>
    this.isExtractionPhase ? !this.isConfirmable(row) : row.status !== 'Failed';

  /** Restarts the polling timer (after confirm or retry re-queues work). */
  private readonly pollTrigger$ = new BehaviorSubject<void>(undefined);

  constructor() {
    this.pollTrigger$
      .pipe(
        switchMap(() =>
          timer(0, POLL_INTERVAL_MS).pipe(
            switchMap(() =>
              forkJoin({
                status: this.clService.getImportStatus(this.importJobId),
                items: this.clService.getImportItems(this.importJobId),
              })
            ),
            tap(result => this.applyResult(result.status, result.items)),
            // Keep polling only while the backend is actively working (Extracting/Importing);
            // pause at Ready (await confirm) and at terminal states.
            takeWhile(result => this.isActive(result.status.status), true)
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.templateMap.set('status', this.statusTpl);
  }

  // --- phase helpers ---
  get currentStatus(): ImportJobStatus | null {
    return this.status?.status ?? null;
  }
  get isExtractionPhase(): boolean {
    const s = this.currentStatus;
    return s === 'Extracting' || s === 'Extracted' || s === 'Ready';
  }
  get isReady(): boolean {
    return this.currentStatus === 'Ready';
  }
  get showProgress(): boolean {
    const s = this.currentStatus;
    return s === 'Extracting' || s === 'Importing';
  }
  get progressMode(): 'determinate' | 'indeterminate' {
    return this.currentStatus === 'Importing' ? 'determinate' : 'indeterminate';
  }
  get progressValue(): number {
    const total = this.status?.totalCount ?? 0;
    if (this.currentStatus === 'Importing' && total > 0) {
      return ((this.status?.processedCount ?? 0) / total) * 100;
    }
    return 0;
  }
  get progressLabel(): string {
    const s = this.status;
    if (!s) return '';
    switch (s.status) {
      case 'Extracting':
        return `Extracting respondents… ${s.extractedCount}`;
      case 'Ready':
        return `${s.totalCount} respondents extracted — select and confirm`;
      case 'Importing':
        return `Importing ${s.processedCount}/${s.totalCount}`;
      default:
        return `${s.processedCount}/${s.totalCount} imported`;
    }
  }

  get confirmableCount(): number {
    return this.rows.filter(r => r.isSelected && r.status === 'Extracted')
      .length;
  }
  get selectedFailedCount(): number {
    return this.rows.filter(r => r.isSelected && r.status === 'Failed').length;
  }

  confirmImport(): void {
    const ids = this.rows
      .filter(r => r.isSelected && r.status === 'Extracted')
      .map(r => r.id);
    if (ids.length === 0) {
      this.toast.showToast({
        type: 'error',
        title: 'Import',
        message: 'Select at least one respondent to import.',
      });
      return;
    }
    this.clService.confirmImport(this.importJobId, ids).subscribe({
      next: () => {
        this.toast.showToast({
          type: 'success',
          title: 'Import',
          message: `Importing ${ids.length} respondent(s).`,
        });
        this.pollTrigger$.next();
      },
      error: () =>
        this.toast.showToast({
          type: 'error',
          title: 'Import',
          message: 'Could not start the import.',
        }),
    });
  }

  retrySelected(): void {
    const ids = this.rows
      .filter(r => r.isSelected && r.status === 'Failed')
      .map(r => r.id);
    this.retry(ids);
  }

  onAction(event: EventAction): void {
    if (event.data.id === 'retry') {
      this.retry([(event.item as ImportItemRow).id]);
    }
  }

  goBack(): void {
    this.router.navigate(['evaluation-process']);
  }

  private retry(itemIds: number[]): void {
    if (itemIds.length === 0) {
      this.toast.showToast({
        type: 'error',
        title: 'Retry',
        message: 'Select at least one failed student to retry.',
      });
      return;
    }
    this.clService.retryImportItems(this.importJobId, itemIds).subscribe({
      next: () => {
        this.toast.showToast({
          type: 'success',
          title: 'Retry',
          message: `Re-queued ${itemIds.length} student(s).`,
        });
        this.pollTrigger$.next();
      },
      error: () =>
        this.toast.showToast({
          type: 'error',
          title: 'Retry',
          message: 'Could not re-queue the selected students.',
        }),
    });
  }

  private isConfirmable(row: ImportItemRow): boolean {
    return (
      row.status === 'Extracted' &&
      !row.isAlreadyImported &&
      isFieldNameValid(row.name) &&
      isFieldEmailValid(row.email)
    );
  }

  private applyResult(
    status: ImportJobStatusModel,
    items: ImportJobItem[]
  ): void {
    this.status = status;
    // New array reference so the table rebuilds its display cache. Pre-select the respondents
    // that are eligible to import; failed-retry selection is left to the user.
    this.rows = items.map(item => {
      const row: ImportItemRow = {
        id: item.id,
        isSelected: false,
        name: item.studentName,
        email: item.studentEmail,
        cohort: item.cohort ?? '',
        status: item.status,
        retryCount: item.retryCount,
        isAlreadyImported: item.isAlreadyImported,
        errorMessage: item.errorMessage,
      };
      row.isSelected = this.isConfirmable(row);
      return row;
    });
  }

  private isActive(status: ImportJobStatus): boolean {
    return IMPORT_ACTIVE_STATUSES.includes(status);
  }
}
