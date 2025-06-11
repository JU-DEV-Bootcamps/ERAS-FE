import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EvaluationModel } from '../../../../../core/models/evaluation.model';
import { EmptyDataComponent } from '../../../../../shared/components/empty-data/empty-data.component';

@Component({
  selector: 'app-badge-status',
  templateUrl: './badge-status.component.html',
  styleUrl: './badge-status.component.scss',
  imports: [MatIconModule, CommonModule, EmptyDataComponent],
})
export class BadgeStatusComponent {
  @Input() element: EvaluationModel | undefined;

  getClassName(value: string): string {
    return value ? value.replace(/\s+/g, '_') : '';
  }
}
