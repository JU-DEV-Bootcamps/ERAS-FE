import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { ServiceConfigurationCard } from './service-card.model';
import { forkJoin, map } from 'rxjs';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';

@Component({
  selector: 'app-service-card-readable',
  imports: [ChipComponent, CommonModule],
  templateUrl: './service-card-readable.component.html',
  styleUrl: './service-card-readable.component.scss',
})
export class ServiceCardReadableComponent implements OnInit {
  serviceName!: string;
  serviceCreated!: string;
  serviceProviderName!: string;
  isLoading = false;
  configurationsService = inject(ConfigurationsService);
  configurations: ConfigurationsModel[] = [];
  serviceProvidersService = inject(ServiceProvidersService);
  cosmicLatteService = inject(CosmicLatteService);
  serviceCards: ServiceConfigurationCard[] = [];
  private readonly userData = inject(UserDataService);
  userId = '';

  ngOnInit() {
    const profile = this.userData.user()!;
    this.userId = profile.id || '';
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading = true;
    forkJoin({
      configurations: this.configurationsService.getConfigurationsByUserId(
        this.userId
      ),
      providers: this.serviceProvidersService.getAllServiceProviders(),
    }).subscribe({
      next: ({ configurations, providers }) => {
        const cards$ = configurations.map(config => {
          const provider = providers.find(
            p => p.id === config.serviceProviderId
          );

          return this.cosmicLatteService.healthCheck(config.id).pipe(
            map(response => ({
              configurationName: config.configurationName,
              serviceProviderName: provider?.serviceProviderName || '',
              createdBy: provider?.audit.createdBy || '',
              isActive: response?.status ?? false,
            }))
          );
        });
        forkJoin(cards$).subscribe({
          next: cards => {
            this.serviceCards = cards;
          },
          error: err => console.error(err),
          complete: () => {
            this.isLoading = false;
          },
        });
      },
      error: err => {
        console.error('Error loading data', err);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
