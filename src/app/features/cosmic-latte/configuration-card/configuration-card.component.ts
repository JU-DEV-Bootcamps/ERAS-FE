import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { ServiceProviderModel } from '@core/models/service-providers.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HealthCheckResponse } from '@core/models/cosmic-latte-request.model';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NewConfigurationModalComponent } from '../new-configuration-modal/new-configuration-modal.component';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '@shared/components/modal-dialog/modal-dialog.component';
import { TYPE_TITLE } from '@core/constants/messages';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  DialogData,
  DialogType,
} from '@shared/components/modal-dialog/types/dialog';
import { MODAL_DEFAULT_CONF } from '@core/constants/modal';

@Component({
  selector: 'app-configuration-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    CommonModule,
    MatTooltipModule,
  ],
  templateUrl: './configuration-card.component.html',
  styleUrl: './configuration-card.component.css',
})
export class ConfigurationCardComponent implements OnInit {
  @Input() configuration!: ConfigurationsModel;
  @Input() configurations!: ConfigurationsModel[];
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
        this.healthCheckResponse = {
          ...response,
          status: response.status ?? false,
        };
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
      data: {
        existingConfiguration: configuration,
        configurations: this.configurations.filter(
          config =>
            config.configurationName !== this.configuration.configurationName
        ),
        action: 'edit',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedConfiguration: ConfigurationsModel = {
          ...configuration,
          configurationName: result.configurationName,
          baseURL: result.baseURL,
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
    type: DialogType,
    deleteConfirmFunction?: () => void
  ): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); // Remove focus from the button - avoid console warning
    this.dialog.open(ModalComponent, {
      ...MODAL_DEFAULT_CONF,
      data: {
        type,
        title: TYPE_TITLE[type],
        data: {
          title: TYPE_TITLE[type],
          details: [descriptionMessage],
          message: descriptionMessage,
        },
        action: {
          label: 'Delete',
          action: deleteConfirmFunction,
        },
      } as DialogData,
    });
  }

  deleteConfigurationConfirmation(id: number) {
    if (id) {
      this.openAlertDialog(
        `Are you sure you want to delete the configuration?`,
        'success',
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
