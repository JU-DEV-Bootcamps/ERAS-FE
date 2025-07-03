import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ConfigurationsModel } from '../../../core/models/configurations.model';
import { ServiceProviderModel } from '../../../core/models/service-providers.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HealthCheckResponse } from '../../../core/models/cosmic-latte-request.model';
import { CosmicLatteService } from '../../../core/services/api/cosmic-latte.service';
import { ConfigurationsService } from '../../../core/services/api/configurations.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NewConfigurationModalComponent } from '../new-configuration-modal/new-configuration-modal.component';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { GENERAL_MESSAGES } from '../../../core/constants/messages';

@Component({
  selector: 'app-configuration-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './configuration-card.component.html',
  styleUrl: './configuration-card.component.css',
})
export class ConfigurationCardComponent implements OnInit {
  @Input() configuration!: ConfigurationsModel;
  @Input() serviceProviders: ServiceProviderModel[] = [];
  @Output() updateList = new EventEmitter<boolean>();
  isLoading = false;
  healthCheckResponse!: HealthCheckResponse;

  ngOnInit() {
    this.testConnection(this.configuration);
  }

  cosmicLatteService = inject(CosmicLatteService);
  configurationsService = inject(ConfigurationsService);

  constructor(private dialog: MatDialog) {}

  testConnection(configuration: ConfigurationsModel) {
    this.isLoading = true;
    this.cosmicLatteService.healthCheck(configuration.id).subscribe({
      next: response => {
        this.healthCheckResponse = response;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        console.error('Error while obtaining data', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  editConfiguration(configuration: ConfigurationsModel) {
    const dialogRef = this.dialog.open(NewConfigurationModalComponent, {
      width: '400px',
      disableClose: true,
      data: { existingConfiguration: configuration },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Updated configuration data:', result);
        const updatedConfiguration: ConfigurationsModel = {
          ...configuration,
          configurationName: result.configurationName,
          baseURL: result.baseUrl,
          encryptedKey: result.apiKey,
          serviceProviderId: result.serviceProvider,
        };
        this.configurationsService
          .updateConfiguration(updatedConfiguration)
          .subscribe({
            next: response => {
              console.log('Configuration updated successfully', response);
            },
            error: error => {
              console.error('Error while updating configuration', error);
            },
            complete: () => {
              this.updateList.emit(true);
            },
          });
      }
    });
  }
  openAlertDialog(
    descriptionMessage: string,
    isSuccess: boolean,
    deleteConfirmFunction?: () => void
  ): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(ModalComponent, {
      width: '450px',
      height: 'auto',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        isSuccess: isSuccess,
        title: isSuccess
          ? GENERAL_MESSAGES.SUCCESS_TITLE
          : GENERAL_MESSAGES.ERROR_TITLE,
        success: {
          details: descriptionMessage,
        },
        error: {
          title: GENERAL_MESSAGES.ERROR_TITLE,
          details: [descriptionMessage],
          message: descriptionMessage,
        },
        deleteConfirmFunction: deleteConfirmFunction,
      },
    });
  }

  deleteConfigurationConfirmation(id: number) {
    if (id) {
      this.openAlertDialog(
        `Are you sure you want to delete the configuration?`,
        false,
        () => this.deleteConfiguration(id)
      );
    } else {
      console.warn("id wasn't provided");
    }
  }

  deleteConfiguration(configurationId: number) {
    this.configurationsService.deleteConfiguration(configurationId).subscribe({
      next: () => {
        console.log(
          `Configuration with ID ${configurationId} deleted successfully.`
        );
        this.updateList.emit(true);
      },
      error: error => {
        console.error(
          `Error deleting configuration with ID ${configurationId}:`,
          error
        );
      },
    });
  }
}
