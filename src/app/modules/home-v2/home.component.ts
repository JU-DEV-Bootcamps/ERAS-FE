import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SummaryDetailsV2Component } from './summary-details/summary-details.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { ServiceCardReadableComponent } from '@shared/components/cards/service-card-readable/service-card-readable.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-v2',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    SummaryDetailsV2Component,
    ChipComponent,
    ServiceCardReadableComponent,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeV2Component {
  lastUpdated: Date | null = null;

  handleDate(date: Date) {
    this.lastUpdated = date;
  }

  get lastUpdatedLabel(): string {
    if (!this.lastUpdated) return '';
    const diff = Math.floor((Date.now() - this.lastUpdated.getTime()) / 1000);
    if (diff < 10) return 'Just Now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return this.lastUpdated.toLocaleTimeString();
  }
}
