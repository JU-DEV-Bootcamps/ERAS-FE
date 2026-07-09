import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AssessmentStatus } from '@core/models/assessment.model';

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
    [AssessmentStatus.Remitted]: 'Remitted',
    [AssessmentStatus.InProgress]: 'In Progress',
    [AssessmentStatus.Finalized]: 'Finalized',
  };

  private readonly statusClassMap: Record<AssessmentStatus, string> = {
    [AssessmentStatus.Remitted]: 'status-remitted',
    [AssessmentStatus.InProgress]: 'status-in-progress',
    [AssessmentStatus.Finalized]: 'status-finalized',
  };
}
