import { Component, inject, OnInit } from '@angular/core';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { ServiceProviderModel } from '@core/models/service-providers.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { ChipComponent } from '@shared/components/chip/chip.component';

@Component({
  selector: 'app-service-card-readable',
  imports: [ChipComponent],
  templateUrl: './service-card-readable.component.html',
  styleUrl: './service-card-readable.component.scss',
})
export class ServiceCardReadableComponent implements OnInit {
  serviceName!: string;
  serviceCreated!: string;
  serviceProviderName!: string;
  isActive = true;
  isLoading = false;
  configurationsService = inject(ConfigurationsService);
  configurations: ConfigurationsModel[] = [];
  serviceProvidersService = inject(ServiceProvidersService);
  serviceProviders: ServiceProviderModel[] = [];
  private readonly userData = inject(UserDataService);
  userId = '';

  ngOnInit() {
    const profile = this.userData.user()!;
    this.loadServiceProviders();
    this.userId = profile.id || '';
    this.loadConfigurations(this.userId);
  }

  loadConfigurations(userId: string) {
    this.configurationsService.getConfigurationsByUserId(userId).subscribe({
      next: response => {
        this.configurations = response;
        this.serviceName = response[0].configurationName;
      },
      error: error => {
        console.error('Error while loading configurations', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  loadServiceProviders() {
    this.serviceProvidersService.getAllServiceProviders().subscribe({
      next: response => {
        this.serviceProviders = response;

        this.serviceCreated = response[0].audit.createdBy;
        this.serviceProviderName = response[0].serviceProviderName;
      },
      error: error => {
        console.error('Error while loading service providers', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
