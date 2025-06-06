import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HealthCheckResponse } from '../../core/models/cosmic-latte-request.model';
import { CosmicLatteService } from '../../core/services/api/cosmic-latte.service';

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
        console.error('Error while obtaining data', error);
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
