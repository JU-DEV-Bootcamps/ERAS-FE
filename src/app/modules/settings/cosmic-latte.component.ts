import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ConfigurationsModel } from '@core/models/configurations.model';
import { ServiceProviderModel } from '@core/models/service-providers.model';

import { ConfigurationsService } from '@core/services/api/configurations.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { UserDataService } from '@core/services/access/user-data.service';

import { ConfigurationCardComponent } from './configuration-card/configuration-card.component';
import { NewConfigurationModalComponent } from '../../shared/components/modals/new-configuration-modal/new-configuration-modal.component';

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
  private readonly userData = inject(UserDataService);
  healthCheckStatus = true;
  userId = '';

  ngOnInit() {
    const profile = this.userData.user()!;
    this.loadServiceProviders();
    this.userId = profile.id || '';
    this.loadConfigurations(this.userId);
  }

  createConfiguration() {
    const dialogRef = this.dialog.open(NewConfigurationModalComponent, {
      width: '400px',
      disableClose: true,
      data: { configurations: this.configurations, action: 'create' },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newConfiguration: ConfigurationsModel = {
          id: 0,
          userId: this.userId,
          configurationName: result.configurationName,
          baseURL: result.baseURL,
          encryptedKey: result.apiKey,
          isDeleted: false,
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
              console.log('Configuration created successfully', response);
            },
            error: error => {
              console.error('Error while creating configuration', error);
            },
            complete: () => {
              this.loadConfigurations(this.userId);
            },
          });
      }
    });
  }

  loadConfigurations(userId: string) {
    this.configurationsService.getConfigurationsByUserId(userId).subscribe({
      next: response => {
        this.configurations = response;
        console.log('Configurations loaded successfully');
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
      this.loadConfigurations(this.userId);
    }
  }
}
