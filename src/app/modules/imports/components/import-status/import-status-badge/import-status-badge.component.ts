import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ImportJobStatus } from '@core/models/import-job.model';

@Component({
  selector: 'app-import-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-status-badge.component.html',
  styleUrl: './import-status-badge.component.scss',
})
export class ImportStatusBadgeComponent {
  @Input({ required: true }) status!: ImportJobStatus;

  protected get label(): string {
    return this.statusLabelMap[this.status] ?? this.status;
  }

  protected get cssClass(): string {
    return this.statusClassMap[this.status] ?? 'status-queued';
  }

  private readonly statusLabelMap: Record<ImportJobStatus, string> = {
    Queued: 'Queued',
    Running: 'Running',
    Completed: 'Completed',
    Failed: 'Failed',
    PartiallyCompleted: 'Partially completed',
    Extracting: 'Extracting',
    Extracted: 'Extracted',
    Ready: 'Ready',
    Importing: 'Importing',
    Skipped: 'Skipped',
  };

  private readonly statusClassMap: Record<ImportJobStatus, string> = {
    Queued: 'status-queued',
    Running: 'status-running',
    Completed: 'status-completed',
    Failed: 'status-failed',
    PartiallyCompleted: 'status-partial',
    Extracting: 'status-running',
    Extracted: 'status-queued',
    Ready: 'status-completed',
    Importing: 'status-running',
    Skipped: 'status-skipped',
  };
}
