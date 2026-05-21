import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AssessmentStatus } from '../../../../../core/models/assessement.model';

@Component({
  selector: 'app-assessment-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-status-badge.component.html',
  styleUrl: './assessment-status-badge.component.scss',
})
export class AssessmentStatusBadgeComponent {
  @Input({ required: true }) status!: AssessmentStatus;

  protected get label(): string {
    return this.statusLabelMap[this.status] ?? this.status;
  }

  protected get cssClass(): string {
    return this.statusClassMap[this.status] ?? 'status-created';
  }

  private readonly statusLabelMap: Record<AssessmentStatus, string> = {
    [AssessmentStatus.Created]: 'Created',
    [AssessmentStatus.InProgress]: 'In Progress',
    [AssessmentStatus.OnHold]: 'On Hold',
    [AssessmentStatus.Remitted]: 'Remitted',
    [AssessmentStatus.Resolved]: 'Resolved',
    [AssessmentStatus.Rejected]: 'Rejected',
  };

  private readonly statusClassMap: Record<AssessmentStatus, string> = {
    [AssessmentStatus.Created]: 'status-created',
    [AssessmentStatus.InProgress]: 'status-in-progress',
    [AssessmentStatus.OnHold]: 'status-on-hold',
    [AssessmentStatus.Remitted]: 'status-remitted',
    [AssessmentStatus.Resolved]: 'status-resolved',
    [AssessmentStatus.Rejected]: 'status-rejected',
  };
}
