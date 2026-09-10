import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationCardComponent } from './configuration-card.component';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { ServiceProviderModel } from '@core/models/service-providers.model';
import { of, throwError } from 'rxjs';
import { HealthCheckResponse } from '@core/models/cosmic-latte-request.model';

describe('ConfigurationCardComponent', () => {
  let component: ConfigurationCardComponent;
  let fixture: ComponentFixture<ConfigurationCardComponent>;
  let mockCosmicLatteService: jasmine.SpyObj<CosmicLatteService>;
  let mockConfigurationsService: jasmine.SpyObj<ConfigurationsService>;

  beforeEach(async () => {
    mockCosmicLatteService = jasmine.createSpyObj('CosmicLatteService', [
      'healthCheck',
    ]);
    mockConfigurationsService = jasmine.createSpyObj('ConfigurationsService', [
      'updateConfiguration',
      'deleteConfiguration',
    ]);

    await TestBed.configureTestingModule({
      imports: [ConfigurationCardComponent, MatDialogModule],
      providers: [
        { provide: CosmicLatteService, useValue: mockCosmicLatteService },
        { provide: ConfigurationsService, useValue: mockConfigurationsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurationCardComponent);
    component = fixture.componentInstance; // Simular inputs requeridos

    component.configuration = {
      id: 1,
      configurationName: 'Test Config',
      baseURL: 'https://example.com',
      encryptedKey: 'abc123',
      serviceProviderId: 1,
    } as ConfigurationsModel;

    component.serviceProviders = [
      { id: 1, serviceProviderName: 'Provider A' } as ServiceProviderModel,
    ]; // Simular respuesta del healthCheck con la nueva estructura

    const mockHealthCheckResponse: HealthCheckResponse = {
      status: true,
      dateTime: '2025-07-01T12:00:00Z',
    };
    mockCosmicLatteService.healthCheck.and.returnValue(
      of(mockHealthCheckResponse)
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call healthCheck on init and set response', () => {
    expect(mockCosmicLatteService.healthCheck).toHaveBeenCalledWith(1);
    expect(component.healthCheckResponse).toEqual({
      status: true,
      dateTime: '2025-07-01T12:00:00Z',
    });
  });
});

describe('ConfigurationCardComponent - additional interactions', () => {
  let component: ConfigurationCardComponent;
  let fixture: ComponentFixture<ConfigurationCardComponent>;
  let mockCosmicLatteService: jasmine.SpyObj<CosmicLatteService>;
  let mockConfigurationsService: jasmine.SpyObj<ConfigurationsService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockDialogRef: jasmine.SpyObj<{ afterClosed: () => unknown }>;

  const baseConfiguration = {
    id: 1,
    configurationName: 'Test Config',
    baseURL: 'https://example.com',
    encryptedKey: 'abc123',
    serviceProviderId: 1,
  } as ConfigurationsModel;

  beforeEach(async () => {
    mockCosmicLatteService = jasmine.createSpyObj('CosmicLatteService', [
      'healthCheck',
    ]);
    mockConfigurationsService = jasmine.createSpyObj('ConfigurationsService', [
      'updateConfiguration',
      'deleteConfiguration',
    ]);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue(mockDialogRef as never);

    mockCosmicLatteService.healthCheck.and.returnValue(
      of({ status: true, dateTime: '2025-07-01T12:00:00Z' })
    );

    await TestBed.configureTestingModule({
      imports: [ConfigurationCardComponent],
      providers: [
        { provide: CosmicLatteService, useValue: mockCosmicLatteService },
        { provide: ConfigurationsService, useValue: mockConfigurationsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurationCardComponent);
    component = fixture.componentInstance;

    // Reemplazo directo del dialog inyectado por constructor,
    // evita conflictos de DI con MatDialogModule importado por el propio componente.
    (component as unknown as { dialog: MatDialog }).dialog = mockDialog;

    component.configuration = baseConfiguration;
    component.configurations = [
      baseConfiguration,
      { ...baseConfiguration, id: 2, configurationName: 'Other Config' },
    ];
    component.serviceProviders = [
      { id: 1, serviceProviderName: 'Provider A' } as ServiceProviderModel,
    ];

    fixture.detectChanges();
  });

  it('should set isLoading false and log error when healthCheck fails', () => {
    spyOn(console, 'error');
    mockCosmicLatteService.healthCheck.and.returnValue(
      throwError(() => new Error('fail'))
    );

    component.testConnection(baseConfiguration);

    expect(component.isLoading).toBeFalse();
    expect(console.error).toHaveBeenCalledWith(
      'Error while obtaining data',
      jasmine.any(Error)
    );
  });

  it('should open edit dialog and update configuration when result is returned', () => {
    spyOn(console, 'log');
    mockDialogRef.afterClosed.and.returnValue(
      of({
        configurationName: 'Updated Config',
        baseURL: 'https://updated.com',
        apiKey: 'newKey',
        serviceProvider: 2,
      })
    );
    mockConfigurationsService.updateConfiguration.and.returnValue(
      of({} as ConfigurationsModel)
    );
    spyOn(component.updateList, 'emit');

    component.editConfiguration(baseConfiguration);

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockConfigurationsService.updateConfiguration).toHaveBeenCalledWith({
      ...baseConfiguration,
      configurationName: 'Updated Config',
      baseURL: 'https://updated.com',
      encryptedKey: 'newKey',
      serviceProviderId: 2,
    });
    expect(component.updateList.emit).toHaveBeenCalledWith(true);
  });

  it('should log error when updateConfiguration fails', () => {
    spyOn(console, 'error');
    mockDialogRef.afterClosed.and.returnValue(
      of({
        configurationName: 'Updated Config',
        baseURL: 'https://updated.com',
        apiKey: 'newKey',
        serviceProvider: 2,
      })
    );
    mockConfigurationsService.updateConfiguration.and.returnValue(
      throwError(() => new Error('update failed'))
    );

    component.editConfiguration(baseConfiguration);

    expect(console.error).toHaveBeenCalledWith(
      'Error while updating configuration',
      jasmine.any(Error)
    );
  });

  it('should not call updateConfiguration when dialog is closed without result', () => {
    mockDialogRef.afterClosed.and.returnValue(of(undefined));

    component.editConfiguration(baseConfiguration);

    expect(
      mockConfigurationsService.updateConfiguration
    ).not.toHaveBeenCalled();
  });

  it('should open alert dialog with correct data', () => {
    component.openAlertDialog('Are you sure?', 'success');

    expect(mockDialog.open).toHaveBeenCalled();
    const callArgs = mockDialog.open.calls.mostRecent().args;
    const dialogConfig = callArgs[1] as { data: { data: { message: string } } };
    expect(dialogConfig.data.data.message).toBe('Are you sure?');
  });

  it('should call openAlertDialog when deleteConfigurationConfirmation is called with a valid id', () => {
    spyOn(component, 'openAlertDialog');

    component.deleteConfigurationConfirmation(1);

    expect(component.openAlertDialog).toHaveBeenCalledWith(
      'Are you sure you want to delete the configuration?',
      'success',
      jasmine.any(Function)
    );
  });

  it('should warn and not open dialog when deleteConfigurationConfirmation is called without an id', () => {
    spyOn(console, 'warn');
    spyOn(component, 'openAlertDialog');

    component.deleteConfigurationConfirmation(0);

    expect(console.warn).toHaveBeenCalledWith("id wasn't provided");
    expect(component.openAlertDialog).not.toHaveBeenCalled();
  });

  it('should delete configuration and emit updateList on success', () => {
    spyOn(console, 'log');
    mockConfigurationsService.deleteConfiguration.and.returnValue(of(void 0));
    spyOn(component.updateList, 'emit');

    component.deleteConfiguration(1);

    expect(mockConfigurationsService.deleteConfiguration).toHaveBeenCalledWith(
      1
    );
    expect(component.updateList.emit).toHaveBeenCalledWith(true);
  });

  it('should log error when deleteConfiguration fails', () => {
    spyOn(console, 'error');
    mockConfigurationsService.deleteConfiguration.and.returnValue(
      throwError(() => new Error('delete failed'))
    );

    component.deleteConfiguration(1);

    expect(console.error).toHaveBeenCalledWith(
      'Error deleting configuration with ID 1:',
      jasmine.any(Error)
    );
  });
});
