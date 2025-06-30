import Keycloak from 'keycloak-js';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfigurationsService } from '../../core/services/api/configurations.service';
import { ServiceProvidersService } from '../../core/services/api/service-providers.service';
import { MatCardModule } from '@angular/material/card';
import { ServiceProviderModel } from '../../core/models/service-providers.model';
import { ConfigurationsModel } from '../../core/models/configurations.model';
import { MatDialog } from '@angular/material/dialog';
import { NewConfigurationModalComponent } from './new-configuration-modal/new-configuration-modal.component';
import { ConfigurationCardComponent } from './configuration-card/configuration-card.component';

@Component({
  selector: 'app-cosmic-latte',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    ConfigurationCardComponent,
  ],
  templateUrl: './cosmic-latte.component.html',
  styleUrl: './cosmic-latte.component.scss',
})
export class CosmicLatteComponent implements OnInit {
  isLoading = true;
  configurationsService = inject(ConfigurationsService);
  configurations: ConfigurationsModel[] = [];
  serviceProvidersService = inject(ServiceProvidersService);
  serviceProviders: ServiceProviderModel[] = [];
  readonly dialog = inject(MatDialog);
  healthCheckStatus = true;
  userId = '';
  constructor(private readonly keycloak: Keycloak) {}

  async ngOnInit() {
    this.loadConfigurations();
    this.loadServiceProviders();
    const profile = await this.keycloak.loadUserProfile();
    this.userId = profile.id || '';
  }

  createConfiguration() {
    const dialogRef = this.dialog.open(NewConfigurationModalComponent, {
      width: '400px',
      disableClose: true,
      data: {},
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New configuration data:', result);
        const newConfiguration: ConfigurationsModel = {
          id: 0,
          userId: this.userId,
          configurationName: result.configurationName,
          baseUrl: result.baseUrl,
          encryptedKey: result.apiKey,
          serviceProviderId: result.serviceProvider,
          audit: {
            createdBy: 'configurator',
            createdAt: new Date(),
            modifiedBy: 'configurator',
            modifiedAt: new Date(),
          },
        };
        this.configurationsService
          .createConfiguration(newConfiguration)
          .subscribe({
            next: response => {
              this.configurations.push(response);
              console.log('Configuration created successfully', response);
            },
            error: error => {
              console.error('Error while creating configuration', error);
            },
            complete: () => {
              this.loadConfigurations();
            },
          });
      }
    });
  }

  loadConfigurations() {
    this.configurationsService.getAllConfigurations().subscribe({
      next: response => {
        this.configurations = response;
        console.log('Configurations loaded successfully', response);
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
        console.log(
          'Service providers loaded successfully',
          this.serviceProviders
        );
      },
      error: error => {
        console.error('Error while loading service providers', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onConfigurationUpdate(updateList: boolean) {
    if (updateList) {
      this.loadConfigurations();
    }
  }
}
