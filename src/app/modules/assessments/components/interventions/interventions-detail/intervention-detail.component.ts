import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { InterventionPillBadgeComponent } from '../interventions-list/intervention-status-badge/intervention-pill-badge.component';
import { InterventionRowViewModel } from '../interventions-list/intervention-list.component';
import { InterventionService } from '@core/services/api/intervention.service';
import { AttachmentApiService } from '@core/services/api/attachments.service';
import { AttachmentModel } from '@core/models/attachment.model';

@Component({
  selector: 'app-intervention-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    InterventionPillBadgeComponent,
  ],
  templateUrl: './intervention-detail.component.html',
  styleUrl: './intervention-detail.component.scss',
})
export class InterventionDetailComponent {
  private readonly interventionService = inject(InterventionService);
  private readonly attachmentService = inject(AttachmentApiService);

  @Input({ required: true }) data!: InterventionRowViewModel;
  @Input({ required: false }) attachments: AttachmentModel[] = [];

  @Output() close = new EventEmitter<void>();

  displayStudents(): string {
    if (Array.isArray(this.data.studentDisplay)) {
      return this.data.studentDisplay.map(m => m.name).join(', ');
    }
    return this.data.studentDisplay;
  }

  onClose(): void {
    this.close.emit();
  }

  openAttachment(attachmentId: number): void {
    this.attachmentService.downloadAttachment(attachmentId).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    });
  }

  getFileIcon(relativePath: string): string {
    const ext = relativePath.split('.').pop()?.toLowerCase();
    return ext === 'pdf'
      ? 'picture_as_pdf'
      : ext === 'jpg' || ext === 'jpeg' || ext === 'png'
        ? 'image'
        : 'insert_drive_file';
  }

  getFileName(relativePath: string): string {
    return relativePath.split('/').pop() ?? relativePath;
  }
}
