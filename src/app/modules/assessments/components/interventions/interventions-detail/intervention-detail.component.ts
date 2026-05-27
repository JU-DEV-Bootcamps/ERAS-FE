import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { InterventionPillBadgeComponent } from '../interventions-list/intervention-status-badge/intervention-pill-badge.component';
import { InterventionRowViewModel } from '../interventions-list/intervention-list.component';
import { InterventionService } from '@core/services/api/intervention.service';

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

  @Input({ required: true }) data!: InterventionRowViewModel;

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  openAttachment(relativePath: string): void {
    const fileName = relativePath.split('/').pop() ?? relativePath;
    const interventionId = this.data.id!;
    const url = this.interventionService.getAttachmentUrl(
      interventionId,
      fileName
    );
    window.open(url, '_blank');
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
