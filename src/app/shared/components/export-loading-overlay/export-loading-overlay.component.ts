import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ExportStateService } from '@core/services/exports/export-state.service';

@Component({
  selector: 'app-export-loading-overlay',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatProgressBarModule],
  templateUrl: './export-loading-overlay.component.html',
  styleUrl: './export-loading-overlay.component.scss',
})
export class ExportLoadingOverlayComponent {
  exportStateService = inject(ExportStateService);

  showOverlay = computed(() => this.exportStateService.shouldShowOverlay());
  displayMessage = computed(() => this.exportStateService.message());
  progress = computed(() => this.exportStateService.progress());
  exportType = computed(() => this.exportStateService.exportType());
  showProgressBar = computed(() => this.exportType() === 'pdf');

  overlayLabel = computed(() => `Export in progress: ${this.displayMessage()}`);
}
