import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AssessmentStatusBadgeComponent } from '../assessment-list/assessment-status-badge/assessment-status-badge.component';
import { AssessmentRowViewModel } from '../assessment-list/assessment-list.component';

@Component({
  selector: 'app-assessment-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    AssessmentStatusBadgeComponent,
  ],
  templateUrl: './assessment-detail-dialog.component.html',
  styleUrl: './assessment-detail-dialog.component.scss',
})
export class AssessmentDetailDialogComponent {
  @Input({ required: true }) data!: AssessmentRowViewModel;

  @Output() close = new EventEmitter<void>();
  @Output() createIntervention = new EventEmitter<AssessmentRowViewModel>();

  onClose(): void {
    this.close.emit();
  }

  onCreateIntervention(): void {
    this.createIntervention.emit(this.data);
  }
}
