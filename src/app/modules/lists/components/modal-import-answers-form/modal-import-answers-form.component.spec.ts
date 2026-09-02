import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ModalImportAnswersFormComponent } from './modal-import-answers-form.component';
import { HttpClientModule } from '@angular/common/http';
import { UserDataService } from '@core/services/access/user-data.service';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { DialogService } from '@core/services/dialog.service';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { ServiceProviderModel } from '@core/models/service-providers.model';
import { PollName } from '@core/models/poll-request.model';
import { AuditModel } from '@core/models/common/audit.model';
import Keycloak from 'keycloak-js';
import { DatePipe } from '@angular/common';

const keycloakMock = {
  token: 'fake-token',
  logout: jasmine.createSpy('logout'),
};

describe('ModalImportAnswersFormComponent', () => {
  let component: ModalImportAnswersFormComponent;
  let fixture: ComponentFixture<ModalImportAnswersFormComponent>;

  let mockConfigurationsService: jasmine.SpyObj<ConfigurationsService>;
  let mockServiceProvidersService: jasmine.SpyObj<ServiceProvidersService>;
  let mockCosmicLatteService: jasmine.SpyObj<CosmicLatteService>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockDialogRef: jasmine.SpyObj<
    MatDialogRef<ModalImportAnswersFormComponent>
  >;

  const mockAudit: AuditModel = {
    createdBy: 'System',
    modifiedBy: 'System',
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const mockConfigurations: ConfigurationsModel[] = [
    {
      id: 1,
      userId: 'user123',
      configurationName: 'Config A',
      baseURL: 'http://test.com',
      encryptedKey: '3nkRypt3d',
      serviceProviderId: 1,
      isDeleted: false,
      audit: mockAudit,
    },
    {
      id: 2,
      userId: 'user123',
      configurationName: 'Config B',
      baseURL: 'http://test.com',
      encryptedKey: '3nkRypt3d',
      serviceProviderId: 2,
      isDeleted: false,
      audit: mockAudit,
    },
  ];

  const mockServiceProviders: ServiceProviderModel[] = [
    {
      id: 1,
      serviceProviderName: 'Provider A',
      serviceProviderLogo: 'Logo1',
      audit: mockAudit,
    },
  ];

  const mockPollNames: PollName[] = [
    {
      parent: 'evaluationSets:1',
      name: 'Poll A',
      status: 'InProgress',
      selectData: 'PollA',
      country: 'col',
    },
  ];

  function configureTestBed(dialogData: Record<string, unknown>) {
    return TestBed.configureTestingModule({
      imports: [
        ModalImportAnswersFormComponent,
        HttpClientModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        DatePipe,
        {
          provide: UserDataService,
          useValue: {
            user: () => ({ id: 'user123', name: 'Test User' }),
          },
        },
        { provide: Keycloak, useValue: keycloakMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: ConfigurationsService, useValue: mockConfigurationsService },
        {
          provide: ServiceProvidersService,
          useValue: mockServiceProvidersService,
        },
        { provide: CosmicLatteService, useValue: mockCosmicLatteService },
        { provide: DialogService, useValue: mockDialogService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  beforeEach(() => {
    mockConfigurationsService = jasmine.createSpyObj('ConfigurationsService', [
      'getConfigurationsByUserId',
    ]);
    mockServiceProvidersService = jasmine.createSpyObj(
      'ServiceProvidersService',
      ['getAllServiceProviders']
    );
    mockCosmicLatteService = jasmine.createSpyObj('CosmicLatteService', [
      'getPollNames',
    ]);
    mockDialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
    mockDialogService.openDialog.and.returnValue(of({} as MatDialog));
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    mockServiceProvidersService.getAllServiceProviders.and.returnValue(
      of(mockServiceProviders)
    );
    mockConfigurationsService.getConfigurationsByUserId.and.returnValue(of([]));
  });

  async function createComponent(dialogData: Record<string, unknown> = {}) {
    await configureTestBed(dialogData);
    fixture = TestBed.createComponent(ModalImportAnswersFormComponent);
    component = fixture.componentInstance;

    component['preselectedPollState'] = {
      pollName: 'Test Poll',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
    };

    fixture.detectChanges();
  }

  it('should create', async () => {
    await createComponent();
    expect(component).toBeTruthy();
  });

  describe('constructor form group', () => {
    it('should create the form with default empty values when no preselected state is provided', async () => {
      await createComponent();

      expect(component.form.get('start')?.value).toBe('');
      expect(component.form.get('end')?.value).toBe('');
      expect(component.form.get('configuration')?.disabled).toBeTrue();
      expect(component.form.get('pollName')?.disabled).toBeTrue();
    });

    it('should populate start/end from preselected dialog data', async () => {
      await createComponent({
        pollName: 'Preselected poll',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
      });

      expect(component.form.get('start')?.value).toBe('2025-01-01');
      expect(component.form.get('end')?.value).toBe('2025-02-01');
    });
  });

  describe('ngOnInit', () => {
    it('should call getUserConfigurations with the current user id', async () => {
      await createComponent();

      expect(
        mockConfigurationsService.getConfigurationsByUserId
      ).toHaveBeenCalledOnceWith('user123');
    });

    it('should call getServiceProviders', async () => {
      await createComponent();

      expect(
        mockServiceProvidersService.getAllServiceProviders
      ).toHaveBeenCalled();
    });
  });

  describe('getServiceProviders', () => {
    it('should set serviceProviders and stop loading on success', async () => {
      await createComponent();

      expect(component.serviceProviders).toEqual(mockServiceProviders);
      expect(component.loadingSubject.value).toBeFalse();
    });

    it('should open an error dialog and reset the form on failure', async () => {
      mockServiceProvidersService.getAllServiceProviders.and.returnValue(
        throwError(() => ({ message: 'network error' }))
      );

      await createComponent();

      expect(mockDialogService.openDialog).toHaveBeenCalled();
      expect(component.form.pristine).toBeTrue();
      expect(component.form.untouched).toBeTrue();
    });
  });

  describe('getUserConfigurations', () => {
    it('should select the configuration matching preselectedPollState.configurationId', async () => {
      mockConfigurationsService.getConfigurationsByUserId.and.returnValue(
        of(mockConfigurations)
      );

      await createComponent({ configurationId: 2 });

      expect(component.selectedConfiguration).toEqual(mockConfigurations[1]);
      expect(component.form.get('configuration')?.value).toEqual(
        mockConfigurations[1]
      );
    });

    it('should fall back to the first configuration when no match is found', async () => {
      mockConfigurationsService.getConfigurationsByUserId.and.returnValue(
        of(mockConfigurations)
      );
      spyOn(console, 'warn');

      await createComponent({ configurationId: 999 });

      expect(component.selectedConfiguration).toEqual(mockConfigurations[0]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should not select any configuration when the user has none', async () => {
      mockConfigurationsService.getConfigurationsByUserId.and.returnValue(
        of([])
      );

      await createComponent();

      expect(component.selectedConfiguration).toBeNull();
      expect(component.loadingSubject.value).toBeFalse();
    });

    it('should set connectionError and open an error dialog on failure, then close the dialog', async () => {
      mockConfigurationsService.getConfigurationsByUserId.and.returnValue(
        throwError(() => ({ message: 'network error' }))
      );

      await createComponent();

      expect(component.connectionError).toBeTrue();
      expect(mockDialogService.openDialog).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('getServiceProviderName', () => {
    it('should return the matching provider name', async () => {
      await createComponent();
      component.serviceProviders = mockServiceProviders;

      expect(component.getServiceProviderName(mockConfigurations[0])).toBe(
        'Provider A'
      );
    });

    it('should return undefined when no provider matches', async () => {
      await createComponent();
      component.serviceProviders = mockServiceProviders;

      expect(
        component.getServiceProviderName(mockConfigurations[1])
      ).toBeUndefined();
    });
  });

  describe('onConfigurationChange', () => {
    it('should set selectedConfiguration and fetch poll details', async () => {
      mockCosmicLatteService.getPollNames.and.returnValue(of(mockPollNames));
      await createComponent();

      component.onConfigurationChange(mockConfigurations[0]);

      expect(component.selectedConfiguration).toEqual(mockConfigurations[0]);
      expect(mockCosmicLatteService.getPollNames).toHaveBeenCalledOnceWith(1);
    });
  });

  describe('getPollDetails', () => {
    it('should set pollsNames and mark configuration as valid when polls exist', async () => {
      mockCosmicLatteService.getPollNames.and.returnValue(of(mockPollNames));
      await createComponent();

      component.getPollDetails(1);

      expect(component.pollsNames).toEqual(mockPollNames);
      expect(component.configurationIsValid).toBeTrue();
    });

    it('should mark configuration as invalid when no polls are returned', async () => {
      mockCosmicLatteService.getPollNames.and.returnValue(of([]));
      await createComponent();

      component.getPollDetails(1);

      expect(component.configurationIsValid).toBeFalse();
    });

    it('should mark configuration as invalid and open an error dialog on failure', async () => {
      mockCosmicLatteService.getPollNames.and.returnValue(
        throwError(() => ({ message: 'invalid API key' }))
      );
      await createComponent();

      component.getPollDetails(1);

      expect(component.configurationIsValid).toBeFalse();
      expect(mockDialogService.openDialog).toHaveBeenCalled();
    });
  });

  describe('formatDate', () => {
    it('should format a valid date as yyyy-MM-dd', async () => {
      await createComponent();

      expect(component.formatDate(new Date(2025, 0, 15))).toBe('2025-01-15');
    });

    it('should return an empty string for an invalid date', async () => {
      await createComponent();

      expect(component.formatDate(new Date('invalid'))).toBe('');
    });
  });

  describe('resetForm', () => {
    it('should reset the form and mark it pristine and untouched', async () => {
      await createComponent();
      component.form.markAsDirty();
      component.form.markAsTouched();

      component.resetForm();

      expect(component.form.pristine).toBeTrue();
      expect(component.form.untouched).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should not close the dialog when the form is invalid', async () => {
      await createComponent();
      component.form.reset();

      component.onSubmit();

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should close the dialog with the formatted payload on a valid form', async () => {
      mockCosmicLatteService.getPollNames.and.returnValue(of(mockPollNames));
      await createComponent();
      component.selectedConfiguration = mockConfigurations[0];
      component.pollsNames = mockPollNames;

      component.form.get('configuration')?.enable();
      component.form.get('pollName')?.enable();
      component.form.setValue({
        configuration: mockConfigurations[0],
        pollName: 'Poll A',
        start: new Date(2025, 0, 1),
        end: new Date(2025, 1, 1),
      });

      component.onSubmit();

      expect(mockDialogRef.close).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          configuration: mockConfigurations[0],
          pollName: 'Poll A',
          startDate: '2025-01-01',
          endDate: '2025-02-01',
          pollId: mockPollNames[0]._id,
        })
      );
    });
  });
});
