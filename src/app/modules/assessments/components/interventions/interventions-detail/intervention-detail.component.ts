import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { InterventionPillBadgeComponent } from '../interventions-list/intervention-status-badge/intervention-pill-badge.component';
import { InterventionRowViewModel } from '../interventions-list/intervention-list.component';

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
  @Input({ required: true }) data!: InterventionRowViewModel;

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
