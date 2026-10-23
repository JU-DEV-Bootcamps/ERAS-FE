import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';

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
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';

const keycloakMock = {
  token: 'fake-token',
  logout: jasmine.createSpy('logout'),
};

interface UserProfileMock {
  id?: string;
  name: string;
}

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
  let mockUnsavedChangesGuard: jasmine.SpyObj<UnsavedChangesGuardService>;
  let mockUserDataService: { user: jasmine.Spy<() => UserProfileMock> };

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

  const mockPollNames: (PollName & { _id?: string })[] = [
    {
      parent: 'evaluationSets:1',
      name: 'Poll A',
      status: 'InProgress',
      selectData: 'PollA',
      country: 'col',
      _id: 'poll-123',
    } as unknown as PollName,
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
          useValue: mockUserDataService,
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
        {
          provide: UnsavedChangesGuardService,
          useValue: mockUnsavedChangesGuard,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  beforeEach(() => {
    mockUserDataService = {
      user: jasmine
        .createSpy('user')
        .and.returnValue({ id: 'user123', name: 'Test User' }),
    };

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
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', [
      'close',
      'backdropClick',
      'keydownEvents',
    ]);
    mockDialogRef.backdropClick.and.returnValue(NEVER);
    mockDialogRef.keydownEvents.and.returnValue(NEVER);

    mockUnsavedChangesGuard = jasmine.createSpyObj(
      'UnsavedChangesGuardService',
      ['attach', 'requestClose']
    );
    mockUnsavedChangesGuard.requestClose.and.returnValue(of(true));

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
      ...dialogData,
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

    it('should execute the guard attach dirty callback', async () => {
      await createComponent();

      const attachCall = mockUnsavedChangesGuard.attach.calls.mostRecent();
      const dirtyCallback = attachCall.args[1];

      expect(dirtyCallback()).toBeFalse();
      component.form.markAsDirty();
      expect(dirtyCallback()).toBeTrue();
    });
  });

  describe('ngOnInit', () => {
    it('should call getUserConfigurations with the current user id', async () => {
      await createComponent();

      expect(
        mockConfigurationsService.getConfigurationsByUserId
      ).toHaveBeenCalledOnceWith('user123');
    });

    it('should pass empty string when user profile id is missing (branch coverage)', async () => {
      mockUserDataService.user.and.returnValue({
        id: undefined,
        name: 'No ID',
      });
      await createComponent();

      expect(
        mockConfigurationsService.getConfigurationsByUserId
      ).toHaveBeenCalledWith('');
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

    it('should not open dialog if errorShown is already true (branch false)', async () => {
      mockServiceProvidersService.getAllServiceProviders.and.returnValue(
        throwError(() => ({ message: 'network error' }))
      );

      await createComponent();
      mockDialogService.openDialog.calls.reset();

      component.getServiceProviders();

      expect(mockDialogService.openDialog).not.toHaveBeenCalled();
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

    it('should not reopen error dialog if errorShown is already true (branch false)', async () => {
      mockConfigurationsService.getConfigurationsByUserId.and.returnValue(
        throwError(() => ({ message: 'network error' }))
      );

      await createComponent();
      mockDialogService.openDialog.calls.reset();

      component.getUserConfigurations('user123');

      expect(mockDialogService.openDialog).not.toHaveBeenCalled();
    });
  });

  describe('_fillUpState', () => {
    it('should update preselectedPollState when history.state has pollName (branch true)', async () => {
      await createComponent();

      spyOnProperty(history, 'state', 'get').and.returnValue({
        pollName: 'History Poll Name',
        startDate: '2024-05-01',
        endDate: '2024-06-01',
      });

      component['_fillUpState'](mockConfigurations[0]);

      expect(component['preselectedPollState'].pollName).toBe(
        'History Poll Name'
      );
      expect(component['preselectedPollState'].startDate).toBe('2024-05-01');
      expect(component['preselectedPollState'].endDate).toBe('2024-06-01');
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

    it('should return empty string when datePipe.transform returns null (branch fallback)', async () => {
      await createComponent();
      spyOn(component['datePipe'], 'transform').and.returnValue(null);

      expect(component.formatDate(new Date(2025, 0, 15))).toBe('');
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
          pollId: 'poll-123',
        })
      );
    });

    it('should submit null for startDate, endDate and pollId when not provided or unmatched (branches coverage)', async () => {
      await createComponent();
      component.selectedConfiguration = mockConfigurations[0];
      component.pollsNames = [];

      component.form.get('configuration')?.enable();
      component.form.get('pollName')?.enable();
      component.form.setValue({
        configuration: mockConfigurations[0],
        pollName: 'Unmatched Poll',
        start: '',
        end: '',
      });

      spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);

      component.onSubmit();

      expect(mockDialogRef.close).toHaveBeenCalledWith(
        jasmine.objectContaining({
          configuration: mockConfigurations[0],
          pollName: 'Unmatched Poll',
          startDate: null,
          endDate: null,
          pollId: undefined,
        })
      );
    });
  });

  describe('requestClose', () => {
    it('should reset form when closed is true (branch true)', async () => {
      await createComponent();
      spyOn(component, 'resetForm');
      mockUnsavedChangesGuard.requestClose.and.returnValue(of(true));

      component.requestClose();

      expect(mockUnsavedChangesGuard.requestClose).toHaveBeenCalled();
      expect(component.resetForm).toHaveBeenCalled();
    });

    it('should not reset form when closed is false (branch false)', async () => {
      await createComponent();
      spyOn(component, 'resetForm');
      mockUnsavedChangesGuard.requestClose.and.returnValue(of(false));

      component.requestClose();

      expect(component.resetForm).not.toHaveBeenCalled();
    });

    it('should pass dirty callback to requestClose', async () => {
      await createComponent();
      mockUnsavedChangesGuard.requestClose.and.returnValue(of(false));
      component.form.markAsDirty();

      component.requestClose();

      const requestCloseCall =
        mockUnsavedChangesGuard.requestClose.calls.mostRecent();
      const dirtyCallback = requestCloseCall.args[1];

      expect(dirtyCallback()).toBeTrue();
    });
  });
});
