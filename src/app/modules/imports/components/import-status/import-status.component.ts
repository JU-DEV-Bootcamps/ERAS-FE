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

import { BehaviorSubject, forkJoin, timer } from 'rxjs';
import { switchMap, takeWhile, tap } from 'rxjs/operators';

import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { EventAction } from '@core/models/load';
import {
  IMPORT_TERMINAL_STATUSES,
  ImportItemRow,
  ImportJobItem,
  ImportJobStatusModel,
} from '@core/models/import-job.model';
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

  // Disable selection for everything that is not retryable.
  readonly isItemDisabled = (row: ImportItemRow) => row.status !== 'Failed';

  /** Restarts the polling timer (used after a retry re-queues items). */
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
            takeWhile(result => !this.isTerminal(result.status.status), true)
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.templateMap.set('status', this.statusTpl);
  }

  get failedCount(): number {
    return this.rows.filter(row => row.status === 'Failed').length;
  }

  get selectedFailedCount(): number {
    return this.rows.filter(row => row.isSelected && row.status === 'Failed')
      .length;
  }

  retrySelected(): void {
    const ids = this.rows
      .filter(row => row.isSelected && row.status === 'Failed')
      .map(row => row.id);
    this.retry(ids);
  }

  onAction(event: EventAction): void {
    if (event.data.id === 'retry') {
      const row = event.item as ImportItemRow;
      this.retry([row.id]);
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

  private applyResult(
    status: ImportJobStatusModel,
    items: ImportJobItem[]
  ): void {
    this.status = status;
    // New array reference so the table rebuilds its display cache.
    this.rows = items.map(item => ({
      id: item.id,
      isSelected: false,
      name: item.studentName,
      email: item.studentEmail,
      cohort: item.cohort ?? '',
      status: item.status,
      retryCount: item.retryCount,
      errorMessage: item.errorMessage,
    }));
  }

  private isTerminal(status: ImportJobStatusModel['status']): boolean {
    return IMPORT_TERMINAL_STATUSES.includes(status);
  }
}
