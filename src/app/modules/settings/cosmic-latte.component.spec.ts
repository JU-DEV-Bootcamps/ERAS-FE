import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { ConfigurationsModel } from '@core/models/configurations.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { CosmicLatteComponent } from './cosmic-latte.component';

describe('CosmicLatteComponent', () => {
  let component: CosmicLatteComponent;
  let fixture: ComponentFixture<CosmicLatteComponent>;
  let configurations: jasmine.SpyObj<ConfigurationsService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let toast: jasmine.SpyObj<ToastNotificationService>;

  const formResult = {
    configurationName: 'X',
    baseURL: 'https://cl.example.com',
    apiKey: '12345678901234567890123456789012',
    serviceProvider: 3,
  };

  beforeEach(async () => {
    configurations = jasmine.createSpyObj('ConfigurationsService', [
      'getConfigurationsByUserId',
      'createConfiguration',
    ]);
    configurations.getConfigurationsByUserId.and.returnValue(of([]));
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    dialog.open.and.returnValue({ afterClosed: () => of(formResult) } as never);
    toast = jasmine.createSpyObj('ToastNotificationService', ['showToast']);

    await TestBed.configureTestingModule({
      imports: [CosmicLatteComponent],
      providers: [
        { provide: ConfigurationsService, useValue: configurations },
        { provide: ToastNotificationService, useValue: toast },
        {
          provide: ServiceProvidersService,
          useValue: { getAllServiceProviders: () => of([]) },
        },
        {
          provide: UserDataService,
          useValue: { user: () => ({ id: 'user-1' }) },
        },
        {
          provide: CosmicLatteService,
          useValue: jasmine.createSpyObj('CosmicLatteService', ['healthCheck']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CosmicLatteComponent);
    component = fixture.componentInstance;
    (component as unknown as { dialog: MatDialog }).dialog = dialog;
    fixture.detectChanges();
  });

  it('should send the configuration of the current user', () => {
    configurations.createConfiguration.and.returnValue(
      of({} as ConfigurationsModel)
    );

    component.createConfiguration();

    expect(configurations.createConfiguration).toHaveBeenCalledWith(
      jasmine.objectContaining({
        userId: 'user-1',
        configurationName: 'X',
        baseURL: 'https://cl.example.com',
        serviceProviderId: 3,
      })
    );
  });

  it('should confirm the save and reload the list when the configuration is created', () => {
    configurations.createConfiguration.and.returnValue(
      of({} as ConfigurationsModel)
    );
    configurations.getConfigurationsByUserId.calls.reset();

    component.createConfiguration();

    expect(toast.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'success',
        title: 'Configuration saved',
      })
    );
    expect(configurations.getConfigurationsByUserId).toHaveBeenCalledWith(
      'user-1'
    );
  });

  it('should show the reason and keep the list untouched when the API rejects the name', () => {
    spyOn(console, 'error');
    configurations.createConfiguration.and.returnValue(
      throwError(() => ({ error: "A configuration named 'X' already exists." }))
    );
    configurations.getConfigurationsByUserId.calls.reset();

    component.createConfiguration();

    expect(toast.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'error',
        title: 'Configuration not saved',
        message: "A configuration named 'X' already exists.",
      }),
      true
    );
    expect(configurations.getConfigurationsByUserId).not.toHaveBeenCalled();
  });

  it('should use a generic message when the failure has no details', () => {
    spyOn(console, 'error');
    configurations.createConfiguration.and.returnValue(
      throwError(() => new Error('network'))
    );

    component.createConfiguration();

    expect(toast.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'error',
        message: 'The configuration could not be saved. Please try again.',
      }),
      true
    );
  });

  it('should not call the API when the dialog is closed without saving', () => {
    dialog.open.and.returnValue({ afterClosed: () => of(undefined) } as never);

    component.createConfiguration();

    expect(configurations.createConfiguration).not.toHaveBeenCalled();
    expect(toast.showToast).not.toHaveBeenCalled();
  });
});
