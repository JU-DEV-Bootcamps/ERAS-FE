import { TestBed } from '@angular/core/testing';

import { EvaluationProcessFormComponent } from './evaluation-process-form.component';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { EvaluationsService } from '@core/services/api/evaluations.service';
import Keycloak from 'keycloak-js';
import { AuditModel } from '@core/models/common/audit.model';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { signal } from '@angular/core';
import { EvaluationModel } from '@core/models/evaluation.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { Country } from '@wlucha/ng-country-select';
import { ServiceProviderModel } from '@core/models/service-providers.model';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { NotifyService } from '@core/services/notify.service';
import { PollName } from '@core/models/poll-request.model';
import { CreateEvaluationModel } from '@core/models/evaluation-request.model';

interface IDialogData {
  evaluation?: EvaluationModel;
  title?: string;
  buttonText?: string;
  deleteFunction?: (id: number) => void;
  updateFunction?: () => void;
}

describe('EvaluationProcessFormComponent', () => {
  let component: EvaluationProcessFormComponent;

  let fb: FormBuilder;
  let mockDialogRef: jasmine.SpyObj<
    MatDialogRef<EvaluationProcessFormComponent>
  >;
  let mockUserDataService: jasmine.SpyObj<UserDataService>;
  let dependencies: {
    mockDialogRef: MatDialogRef<EvaluationProcessFormComponent>;
    fb: FormBuilder;
    mockUserDataService: UserDataService;
  };

  let mockKeycloak: jasmine.SpyObj<Keycloak>;
  let mockCosmicLatteService: jasmine.SpyObj<CosmicLatteService>;
  let mockConfigurationsService: jasmine.SpyObj<ConfigurationsService>;
  let mockServiceProvidersService: jasmine.SpyObj<ServiceProvidersService>;
  let mockNotifyService: jasmine.SpyObj<NotifyService>;

  const mockEvaluationService: jasmine.SpyObj<EvaluationsService> =
    jasmine.createSpyObj('EvaluationProcessService', [
      'createEvalProc',
      'updateEvaluationProcess',
    ]);

  const mockAudit: AuditModel = {
    createdBy: 'System',
    modifiedBy: 'System',
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const mockEvaluations: EvaluationModel[] = [
    {
      id: 1,
      name: 'Test Evaluation',
      status: 'InProgress',
      startDate: new Date(),
      endDate: new Date(),
      pollName: 'Test Poll',
      country: 'col',
      pollId: 1,
      configurationId: 1,
      evaluationPollId: 1,
      polls: [],
      pollInstances: [],
      latestImportJobId: null,
    },
  ];

  const mockConfigurations: ConfigurationsModel[] = [
    {
      id: 1,
      userId: 'user123',
      configurationName: 'Test Configuration',
      baseURL: 'http://test.com',
      encryptedKey: '3nkRypt3d',
      serviceProviderId: 1,
      isDeleted: false,
      audit: mockAudit,
    },
    {
      id: 2,
      userId: 'user123',
      configurationName: 'Test Configuration',
      baseURL: 'http://test.com',
      encryptedKey: '3nkRypt3d',
      serviceProviderId: 9,
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
    {
      id: 2,
      serviceProviderName: 'Provider B',
      serviceProviderLogo: 'Logo2',
      audit: mockAudit,
    },
  ];

  const mockPollNames: PollName[] = [
    {
      parent: 'Parent Poll A',
      name: 'Short poll name',
      status: 'InProgress',
      selectData: 'PollA',
      country: 'col',
    },
    {
      parent: 'Parent Poll B',
      name: 'a'.repeat(150),
      status: 'InProgress',
      selectData: 'PollA',
      country: 'col',
    },
  ];

  const mockDialogData: IDialogData = {
    evaluation: mockEvaluations[0],
    title: 'New evaluation',
    buttonText: 'Create new evaluation',
  };

  function createComponent(
    dialogData: IDialogData,
    dependencies: {
      mockDialogRef: MatDialogRef<EvaluationProcessFormComponent>;
      fb: FormBuilder;
      mockUserDataService: UserDataService;
    }
  ) {
    return TestBed.runInInjectionContext(
      () =>
        new EvaluationProcessFormComponent(
          dialogData,
          dependencies.mockDialogRef,
          dependencies.fb,
          dependencies.mockUserDataService
        )
    );
  }

  beforeEach(async () => {
    fb = new FormBuilder();
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockUserDataService = jasmine.createSpyObj('UserDataService', [], {
      user: signal({ id: 'user123' }),
    });
    dependencies = { mockDialogRef, fb, mockUserDataService };

    mockCosmicLatteService = jasmine.createSpyObj('CosmicLatteService', [
      'getPollNames',
      'importAnswerBySurvey',
    ]);
    mockKeycloak = jasmine.createSpyObj('Keycloak', ['loadUserProfile']);
    mockConfigurationsService = jasmine.createSpyObj('ConfigurationsService', [
      'getConfigurationsByUserId',
      'getAllConfigurations',
    ]);
    mockServiceProvidersService = jasmine.createSpyObj(
      'ServiceProvidersService',
      ['getAllServiceProviders']
    );
    mockNotifyService = jasmine.createSpyObj('NotifyService', [
      'success',
      'error',
    ]);

    mockKeycloak.loadUserProfile.and.resolveTo({ id: 'user123' });

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        EvaluationProcessFormComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: CosmicLatteService, useValue: mockCosmicLatteService },
        { provide: EvaluationsService, useValue: mockEvaluationService },
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: ConfigurationsService, useValue: mockConfigurationsService },
        {
          provide: ServiceProvidersService,
          useValue: mockServiceProvidersService,
        },
        { provide: NotifyService, useValue: mockNotifyService },
        provideNoopAnimations(),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    component = createComponent({}, dependencies);

    expect(component).toBeTruthy();
  });

  describe('constructor assignments', () => {
    it('should create form with default values when no evaluation is provided', () => {
      component = createComponent({}, dependencies);

      expect(component).toBeTruthy();
      expect(component.form.get('name')?.value).toBe('');
      expect(component.form.get('pollName')?.value).toEqual(
        component.prefereToChooseLater
      );
      expect(component.form.get('country')?.value.value).toBe('');
      expect(component.form.get('startDate')?.value).toBe('');
      expect(component.form.get('endDate')?.value).toBe('');
    });

    it('should create form with values from injected data', () => {
      component = createComponent(mockDialogData, dependencies);

      expect(component).toBeTruthy();
      expect(component.form.get('name')?.value).toBe(
        mockDialogData.evaluation?.name
      );
      expect(component.form.get('pollName')?.value).toBeNull();
      const country: Country = component.form.get('country')?.value as Country;
      expect(country.alpha3).toBe(mockDialogData.evaluation?.country as string);
      expect(component.form.get('startDate')?.value).toBe(
        mockDialogData.evaluation?.startDate
      );
      expect(component.form.get('endDate')?.value).toBe(
        mockDialogData.evaluation?.endDate
      );
    });

    it('should set default title and button text when no data is provided', () => {
      component = createComponent({}, dependencies);

      expect(component).toBeTruthy();
      expect(component.title).toBe('New evaluation process');
      expect(component.buttonText).toBe('Create');
    });

    it('should set title and button text from injected data', () => {
      component = createComponent(mockDialogData, dependencies);

      expect(component).toBeTruthy();
      expect(component.title).toBe(mockDialogData.title);
      expect(component.buttonText).toBe(mockDialogData.buttonText);
    });

    it('should disable configurationId and pollName controls when editing an existing evaluation', () => {
      component = createComponent(mockDialogData, dependencies);

      expect(component).toBeTruthy();
      expect(component.form.get('configuration')?.disabled).toBe(true);
      expect(component.form.get('pollName')?.disabled).toBe(true);
    });

    it('should populate pollDataSelected with injected data', () => {
      component = createComponent(mockDialogData, dependencies);

      expect(component).toBeTruthy();
      expect(component.pollDataSelected).toEqual({
        parent: mockDialogData.evaluation!.evaluationPollId.toString(),
        name: mockDialogData.evaluation!.name,
        status: mockDialogData.evaluation!.status,
        selectData: mockDialogData.evaluation!.pollName,
        country: mockDialogData.evaluation!.country,
      });
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      mockConfigurationsService.getConfigurationsByUserId.and.returnValue(
        of(mockConfigurations)
      );
      mockServiceProvidersService.getAllServiceProviders.and.returnValue(
        of(mockServiceProviders)
      );
    });
    it('should set userId from current user', async () => {
      component = createComponent({}, dependencies);

      await component.ngOnInit();

      expect(component.userId).toBe('user123');
    });

    it('should set default userId to empty string if no profile is loaded', async () => {
      mockUserDataService = jasmine.createSpyObj('UserDataService', [], {
        user: signal(null),
      });
      component = createComponent({}, { ...dependencies, mockUserDataService });

      await component.ngOnInit();

      expect(component.userId).toBe('');
    });

    it('should call getConfigurations and getServiceProviders', async () => {
      component = createComponent({}, dependencies);
      const getConfigurationsSpy = spyOn(component, 'getConfigurations');
      const getServiceProvidersSpy = spyOn(component, 'getServiceProviders');

      await component.ngOnInit();

      expect(getConfigurationsSpy).toHaveBeenCalled();
      expect(getServiceProvidersSpy).toHaveBeenCalled();
    });
  });

  it('should set the selected country and mark form as dirty', () => {
    component = createComponent({}, dependencies);

    component.onCountrySelected({ alpha3: 'col' } as Country);
    expect(component.selectedCountry).toBe('col');
    expect(component.form.dirty).toBeTrue();
  });

  it('should set the selected configuration and fetch pollDetails', () => {
    component = createComponent({}, dependencies);
    const getPollDetailsSpy = spyOn(component, 'getPollDetails');

    component.onConfigurationChange(mockConfigurations[0]);

    expect(component.selectedConfiguration).toEqual(mockConfigurations[0]);
    expect(getPollDetailsSpy).toHaveBeenCalledOnceWith(
      mockConfigurations[0].id
    );
  });

  describe('getServiceProviderName', () => {
    beforeEach(() => {
      component = createComponent({}, dependencies);
      component.serviceProviders = mockServiceProviders;
    });

    it('should return the name of the provider', () => {
      const name = component.getServiceProviderName(mockConfigurations[0]);

      expect(name).toBe(mockServiceProviders[0].serviceProviderName);
    });

    it('should return undefined when no provider matches', () => {
      const name = component.getServiceProviderName(mockConfigurations[1]);

      expect(name).toBeUndefined();
    });
  });

  it('should close the dialog and reset the form', () => {
    component = createComponent({}, dependencies);
    component.form.markAsDirty();
    component.form.markAsTouched();

    component.closeAndResetDialog();

    expect(mockDialogRef.close).toHaveBeenCalled();
    expect(component.form.pristine).toBeTrue();
    expect(component.form.untouched).toBeTrue();
  });

  it('should reset the form values and mark it pristine and untouched', () => {
    component = createComponent(mockDialogData, dependencies);
    component.form.markAsDirty();
    component.form.markAsTouched();

    component.resetForm();

    expect(component.form.get('name')?.value).toBeNull();
    expect(component.form.get('configuration')?.value).toBeNull();
    expect(component.form.get('pollName')?.value).toBeNull();
    expect(component.form.get('country')?.value).toBeNull();
    expect(component.form.get('startDate')?.value).toBeNull();
    expect(component.form.get('endDate')?.value).toBeNull();
    expect(component.form.pristine).toBeTrue();
    expect(component.form.untouched).toBeTrue();
  });

  describe('deleteEvaluation', () => {
    it('should call the provided deleteFunction with evaluationId and close and reset dialog', () => {
      const deleteFunction = jasmine.createSpy('deleteFunction');
      component = createComponent(
        { ...mockDialogData, deleteFunction },
        dependencies
      );
      const closeAndResetDialogSpy = spyOn(component, 'closeAndResetDialog');

      component.deleteEvaluation();

      expect(deleteFunction).toHaveBeenCalledOnceWith(1);
      expect(closeAndResetDialogSpy).toHaveBeenCalled();
    });

    it('should not call closeAndResetDialog if no deleteFunction is provided', () => {
      component = createComponent(mockDialogData, dependencies);
      const closeAndResetDialogSpy = spyOn(component, 'closeAndResetDialog');

      component.deleteEvaluation();

      expect(closeAndResetDialogSpy).not.toHaveBeenCalled();
    });
  });

  describe('getServiceProviders', () => {
    it('should set serviceProviders on success', () => {
      mockServiceProvidersService.getAllServiceProviders.and.returnValue(
        of(mockServiceProviders)
      );
      component = createComponent({}, dependencies);

      component.getServiceProviders();

      expect(component.serviceProviders).toEqual(mockServiceProviders);
    });

    it('should notify an error on failure', () => {
      mockServiceProvidersService.getAllServiceProviders.and.returnValue(
        throwError(() => ({ message: 'mock error' }))
      );
      const errorMessage =
        'Error: An error occurred while trying to get the service providers :mock error';
      component = createComponent({}, dependencies);

      component.getServiceProviders();

      expect(mockNotifyService.error).toHaveBeenCalledOnceWith(errorMessage);
    });
  });

  describe('getConfigurations', () => {
    it('should get configurations by userId when there is no evaluation', () => {
      mockConfigurationsService.getConfigurationsByUserId.and.returnValue(
        of(mockConfigurations)
      );
      component = createComponent({}, dependencies);
      component.userId = 'user123';

      component.getConfigurations();

      expect(
        mockConfigurationsService.getConfigurationsByUserId
      ).toHaveBeenCalledOnceWith('user123');
      expect(
        mockConfigurationsService.getAllConfigurations
      ).not.toHaveBeenCalled();
      expect(component.configurations).toEqual(mockConfigurations);
    });

    it('should notify an error when getting configurations by userId fails', () => {
      mockConfigurationsService.getConfigurationsByUserId.and.returnValue(
        throwError(() => ({ message: 'userId does not exist' }))
      );
      const errorMessage =
        'Error: An error occurred while trying to get the configurations :userId does not exist';

      component = createComponent({}, dependencies);
      component.userId = 'user123';

      component.getConfigurations();

      expect(
        mockConfigurationsService.getConfigurationsByUserId
      ).toHaveBeenCalledOnceWith('user123');
      expect(mockNotifyService.error).toHaveBeenCalledOnceWith(errorMessage);
    });

    it('should get all configurations when there is an evaluation and select the matching configuration', () => {
      mockConfigurationsService.getAllConfigurations.and.returnValue(
        of(mockConfigurations)
      );
      const matchedConfiguration = mockConfigurations[0];
      component = createComponent(mockDialogData, dependencies);
      const getPollDetailsSpy = spyOn(component, 'getPollDetails');

      component.getConfigurations();

      expect(mockConfigurationsService.getAllConfigurations).toHaveBeenCalled();
      expect(
        mockConfigurationsService.getConfigurationsByUserId
      ).not.toHaveBeenCalled();
      expect(component.configurations).toEqual(mockConfigurations);
      expect(component.selectedConfiguration).toEqual(matchedConfiguration);
      expect(component.form.get('configuration')?.value).toEqual(
        matchedConfiguration
      );
      expect(getPollDetailsSpy).toHaveBeenCalledOnceWith(
        matchedConfiguration.id
      );
    });

    it('should notify an error when getting configurations by userId fails', () => {
      mockConfigurationsService.getAllConfigurations.and.returnValue(
        throwError(() => ({ message: 'network error' }))
      );
      const errorMessage =
        'Error: An error occurred while trying to get the configurations :network error';

      component = createComponent(mockDialogData, dependencies);

      component.getConfigurations();

      expect(mockConfigurationsService.getAllConfigurations).toHaveBeenCalled();
      expect(mockNotifyService.error).toHaveBeenCalledOnceWith(errorMessage);
    });
  });

  describe('getPollDetails', () => {
    it('should get poll names and truncate their names under 100 characters on success', () => {
      mockCosmicLatteService.getPollNames.and.returnValue(of(mockPollNames));
      component = createComponent({}, dependencies);

      component.getPollDetails(1);

      expect(mockCosmicLatteService.getPollNames).toHaveBeenCalledOnceWith(1);
      expect(component.pollsNames.length).toBe(3);
      expect(component.pollsNames[0].name).toBe(
        component.prefereToChooseLater.name
      );
      expect(component.pollsNames[1].name).toBe(mockPollNames[0].name);
      expect(component.pollsNames[2].name.length).toBe(100);
    });

    it('should notify an error on failure', () => {
      mockCosmicLatteService.getPollNames.and.returnValue(
        throwError(() => ({ message: 'No poll names found' }))
      );
      const errorMessage =
        'Error: An error occurred while trying to get the survey names :No poll names found';

      component = createComponent({}, dependencies);

      component.getPollDetails(1);

      expect(mockCosmicLatteService.getPollNames).toHaveBeenCalledOnceWith(1);
      expect(mockNotifyService.error).toHaveBeenCalledOnceWith(errorMessage);
    });
  });

  describe('onSubmit - create flow', () => {
    it('should not start evaluation creation process if form is invalid', () => {
      mockEvaluationService.createEvalProc.calls.reset();
      component = createComponent({}, dependencies);
      component.form.reset();

      component.onSubmit();

      expect(mockEvaluationService.createEvalProc).not.toHaveBeenCalled();
    });

    it('should create a new evaluation process, close dialog and notify success', () => {
      mockEvaluationService.createEvalProc.and.returnValue(
        of({} as CreateEvaluationModel)
      );
      const updateFunction = jasmine.createSpy('updateFunction');
      component = createComponent({ updateFunction }, dependencies);
      component.selectedConfiguration = mockConfigurations[0];
      component.selectedCountry = 'col';
      component.form.setValue({
        name: 'Valid form',
        configuration: mockConfigurations[0],
        pollName: mockPollNames[0],
        country: { alpha3: 'col' },
        startDate: new Date(),
        endDate: new Date(),
      });
      component.form.markAsTouched();
      component.form.markAsDirty();
      const closeAndResetDialogSpy = spyOn(component, 'closeAndResetDialog');
      component.onSubmit();

      expect(mockEvaluationService.createEvalProc).toHaveBeenCalled();
      expect(closeAndResetDialogSpy).toHaveBeenCalled();
      expect(mockNotifyService.success).toHaveBeenCalledWith(
        'Sucess: Process created!'
      );
      expect(updateFunction).toHaveBeenCalled();
    });

    it('should omit pollName from payload when pollName.name is empty', () => {
      mockEvaluationService.createEvalProc.calls.reset();
      mockEvaluationService.createEvalProc.and.returnValue(
        of({} as CreateEvaluationModel)
      );

      component = createComponent({}, dependencies);
      component.selectedConfiguration = mockConfigurations[0];
      component.selectedCountry = 'col';
      component.form.setValue({
        name: 'Valid form',
        configuration: mockConfigurations[0],
        pollName: component.prefereToChooseLater,
        country: { alpha3: 'col' },
        startDate: new Date(),
        endDate: new Date(),
      });

      component.onSubmit();

      const payload: CreateEvaluationModel =
        mockEvaluationService.createEvalProc.calls.allArgs()[0][0];
      expect(payload.pollName).toBeUndefined();
    });

    it('should notify an error when creation fails without closing dialog', () => {
      mockEvaluationService.createEvalProc.and.returnValue(
        throwError(() => ({ error: 'Error creating evaluation process' }))
      );
      component = createComponent({}, dependencies);
      component.selectedConfiguration = mockConfigurations[0];
      component.selectedCountry = 'col';
      component.form.setValue({
        name: 'Valid form',
        configuration: mockConfigurations[0],
        pollName: mockPollNames[0],
        country: { alpha3: 'col' },
        startDate: new Date(),
        endDate: new Date(),
      });

      component.onSubmit();
      expect(mockNotifyService.error).toHaveBeenCalledOnceWith(
        'Error creating evaluation process'
      );
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit - update flow', () => {
    it('should not start update evaluation process is form is invalid', () => {
      mockEvaluationService.updateEvaluationProcess.calls.reset();
      component = createComponent(mockDialogData, dependencies);

      component.form.reset();

      component.onSubmit();

      expect(
        mockEvaluationService.updateEvaluationProcess
      ).not.toHaveBeenCalled();
    });

    it('should update the evaluation process, close dialog and notify success', () => {
      mockEvaluationService.updateEvaluationProcess.and.returnValue(
        of({} as EvaluationModel)
      );
      const updateFunction = jasmine.createSpy('updateFunction');
      component = createComponent(
        { ...mockDialogData, updateFunction },
        dependencies
      );

      component.selectedCountry = 'col';
      component.form.setValue({
        name: 'Edited form',
        configuration: mockConfigurations[0],
        pollName: mockPollNames[0],
        country: { alpha3: 'col' },
        startDate: new Date(),
        endDate: new Date(),
      });
      component.form.markAsTouched();
      component.form.markAsDirty();

      const closeAndResetDialogSpy = spyOn(component, 'closeAndResetDialog');

      component.onSubmit();

      expect(mockEvaluationService.updateEvaluationProcess).toHaveBeenCalled();
      expect(closeAndResetDialogSpy).toHaveBeenCalled();
      expect(mockNotifyService.success).toHaveBeenCalledWith(
        'Sucess: Process updated!'
      );
      expect(component.data.updateFunction).toHaveBeenCalled();
    });

    it('should send injected evaluation pollName in payload if provided', () => {
      mockEvaluationService.updateEvaluationProcess.calls.reset();
      mockEvaluationService.updateEvaluationProcess.and.returnValue(
        of({} as EvaluationModel)
      );

      const updateFunction = jasmine.createSpy('updateFunction');
      component = createComponent(
        { ...mockDialogData, updateFunction },
        dependencies
      );

      component.form.get('pollName')?.enable();
      component.selectedConfiguration = mockConfigurations[0];
      component.selectedCountry = 'col';
      component.form.setValue({
        name: 'Valid form',
        configuration: mockConfigurations[0],
        pollName: 'Edited name',
        country: { alpha3: 'col' },
        startDate: new Date(),
        endDate: new Date(),
      });
      component.form.markAsTouched();
      component.form.markAsDirty();

      component.onSubmit();

      const payload: EvaluationModel =
        mockEvaluationService.updateEvaluationProcess.calls.allArgs()[0][0];
      expect(payload.pollName).toBe(mockDialogData.evaluation!.pollName);
    });

    it('should send form pollName.name in payload if no injected evaluation pollName is provided', () => {
      mockEvaluationService.updateEvaluationProcess.calls.reset();
      mockEvaluationService.updateEvaluationProcess.and.returnValue(
        of({} as EvaluationModel)
      );

      const updateFunction = jasmine.createSpy('updateFunction');
      const mockDataWithoutPollName: IDialogData = {
        ...mockDialogData,
        evaluation: { ...mockDialogData.evaluation!, pollName: '' },
      };
      component = createComponent(
        { ...mockDataWithoutPollName, updateFunction },
        dependencies
      );

      component.selectedConfiguration = mockConfigurations[0];
      component.selectedCountry = 'col';
      component.form.setValue({
        name: 'Edited form',
        configuration: mockConfigurations[0],
        pollName: {
          parent: 'Poll123',
          name: 'Edited Name',
          status: 'InProgress',
          selectData: '',
          country: 'col',
        },
        country: { alpha3: 'col' },
        startDate: new Date(),
        endDate: new Date(),
      });
      component.form.markAsTouched();
      component.form.markAsDirty();

      component.onSubmit();

      const payload: EvaluationModel =
        mockEvaluationService.updateEvaluationProcess.calls.allArgs()[0][0];
      expect(payload.pollName).toBe('Edited Name');
    });

    it('should send empty string in payload if no injected evaluation pollName nor form pollName are provided', () => {
      mockEvaluationService.updateEvaluationProcess.calls.reset();
      mockEvaluationService.updateEvaluationProcess.and.returnValue(
        of({} as EvaluationModel)
      );

      const updateFunction = jasmine.createSpy('updateFunction');
      const mockDataWithoutPollName: IDialogData = {
        ...mockDialogData,
        evaluation: { ...mockDialogData.evaluation!, pollName: '' },
      };
      component = createComponent(
        { ...mockDataWithoutPollName, updateFunction },
        dependencies
      );

      component.selectedConfiguration = mockConfigurations[0];
      component.selectedCountry = 'col';
      component.form.setValue({
        name: 'Updated form',
        configuration: mockConfigurations[0],
        pollName: {
          parent: '',
          name: '',
          status: '',
          selectData: '',
          country: '',
        },
        country: { alpha3: 'col' },
        startDate: new Date(),
        endDate: new Date(),
      });
      component.form.markAsTouched();
      component.form.markAsDirty();

      component.onSubmit();

      const payload: EvaluationModel =
        mockEvaluationService.updateEvaluationProcess.calls.allArgs()[0][0];
      expect(payload.pollName).toBe('');
    });

    it('should notify an error when update fails without closing dialog', () => {
      mockEvaluationService.updateEvaluationProcess.and.returnValue(
        throwError(() => ({ error: 'Error updating evaluation process' }))
      );

      component = createComponent(mockDialogData, dependencies);

      component.selectedCountry = 'col';
      component.form.setValue({
        name: 'Edited form',
        configuration: mockConfigurations[0],
        pollName: mockPollNames[0],
        country: { alpha3: 'col' },
        startDate: new Date(),
        endDate: new Date(),
      });
      component.form.markAsTouched();
      component.form.markAsDirty();

      component.onSubmit();
      expect(mockNotifyService.error).toHaveBeenCalledOnceWith(
        'Error updating evaluation process'
      );
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });
});
