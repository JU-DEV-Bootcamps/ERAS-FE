import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  InterventionType,
  InterventionMode,
  InterventionStatus,
} from '@core/models/assessement.model';

type PillValue = InterventionType | InterventionMode | InterventionStatus;

@Component({
  selector: 'app-intervention-pill-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intervention-pill-badge.component.html',
  styleUrl: './intervention-pill-badge.component.scss',
})
export class InterventionPillBadgeComponent {
  @Input({ required: true }) value!: PillValue;

  protected get label(): string {
    return this.labelMap[this.value] ?? this.value;
  }

  protected get cssClass(): string {
    return this.classMap[this.value] ?? '';
  }

  private readonly labelMap: Record<string, string> = {
    [InterventionType.Individual]: 'Individual',
    [InterventionType.Group]: 'Group',
    [InterventionMode.InPlace]: 'In-Place',
    [InterventionMode.Remote]: 'Remote',
    [InterventionStatus.Created]: 'Created',
    [InterventionStatus.InProgress]: 'In Progress',
    [InterventionStatus.OnHold]: 'On Hold',
    [InterventionStatus.Remitted]: 'Remitted',
    [InterventionStatus.Resolved]: 'Resolved',
    [InterventionStatus.Rejected]: 'Rejected',
  };

  private readonly classMap: Record<string, string> = {
    [InterventionType.Individual]: 'type-individual',
    [InterventionType.Group]: 'type-group',
    [InterventionMode.InPlace]: 'mode-inplace',
    [InterventionMode.Remote]: 'mode-remote',
    [InterventionStatus.Created]: 'status-created',
    [InterventionStatus.InProgress]: 'status-in-progress',
    [InterventionStatus.OnHold]: 'status-on-hold',
    [InterventionStatus.Remitted]: 'status-remitted',
    [InterventionStatus.Resolved]: 'status-resolved',
    [InterventionStatus.Rejected]: 'status-rejected',
  };
}
