import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CosmicLatteService } from '../../core/services/cosmic-latte.service';
import { HealthCheckResponse } from '../../shared/models/cosmic-latte/health-check.model';

@Component({
  selector: 'app-cosmic-latte',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './cosmic-latte.component.html',
  styleUrl: './cosmic-latte.component.css',
})
export class CosmicLatteComponent implements OnInit {
  healthCheckResponse: HealthCheckResponse;
  isLoading;
  constructor(private cosmicLatteService: CosmicLatteService) {
    this.healthCheckResponse = {
      status: 'Unhealthy', //Healthy
      totalDuration: '',
      entries: {
        cosmicLatteApi: {
          data: {
            date: '',
          },
          duration: '',
          status: 'Unhealthy',
          tags: [],
        },
      },
    };
    this.isLoading = true;
  }

  healthCheck() {
    this.cosmicLatteService.healthCheck().subscribe({
      next: response => {
        this.healthCheckResponse = response;
      },
      error: error => {
        console.error('Error al obtener datos', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnInit(): void {
    this.healthCheck();
  }

  testConnection() {
    this.isLoading = true;
    this.healthCheck();
  }
}
