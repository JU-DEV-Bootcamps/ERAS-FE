import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewConfigurationModalComponent } from './new-configuration-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ServiceProviderModel } from '@core/models/service-providers.model';

describe('NewConfigurationModalComponent', () => {
  let component: NewConfigurationModalComponent;
  let fixture: ComponentFixture<NewConfigurationModalComponent>;
  let mockDialogRef: jasmine.SpyObj<
    MatDialogRef<NewConfigurationModalComponent>
  >;
  let mockServiceProvidersService: jasmine.SpyObj<ServiceProvidersService>;

  const mockExistingConfiguration: ConfigurationsModel = {
    id: 1,
    configurationName: 'Test Config',
    baseURL: 'https://example.com',
    encryptedKey: 'a'.repeat(32),
    serviceProviderId: 2,
    isDeleted: false,
  } as ConfigurationsModel;

  const mockData = {
    existingConfiguration: mockExistingConfiguration,
  };

  function setUp(data: unknown = mockData) {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockServiceProvidersService = jasmine.createSpyObj(
      'ServiceProvidersService',
      ['getAllServiceProviders']
    );
    mockServiceProvidersService.getAllServiceProviders.and.returnValue(of([]));

    return TestBed.configureTestingModule({
      imports: [
        NewConfigurationModalComponent,
        ReactiveFormsModule,
        FormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        {
          provide: ServiceProvidersService,
          useValue: mockServiceProvidersService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  describe('with an existing configuration', () => {
    beforeEach(async () => {
      await setUp(mockData);

      fixture = TestBed.createComponent(NewConfigurationModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should store the existing configuration', () => {
      expect(component.existingConfiguration).toEqual(
        mockExistingConfiguration
      );
    });

    it('should patch the form with the existing configuration values', () => {
      expect(component.configurationForm.value).toEqual({
        configurationName: mockExistingConfiguration.configurationName,
        baseURL: mockExistingConfiguration.baseURL,
        apiKey: mockExistingConfiguration.encryptedKey,
        serviceProvider: mockExistingConfiguration.serviceProviderId,
      });
    });

    it('should not close the dialog if the form is invalid', () => {
      component.configurationForm.controls['configurationName'].setValue('');
      component.saveConfiguration();

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should log an error when saving with an invalid form', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      component.configurationForm.controls['baseURL'].setValue('');

      component.saveConfiguration();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Form is invalid');
    });

    it('should close the dialog with the existing id when saving a valid form', () => {
      component.saveConfiguration();

      expect(mockDialogRef.close).toHaveBeenCalledWith(
        jasmine.objectContaining({ id: mockExistingConfiguration.id })
      );
    });

    it('should close the dialog when close() is called', () => {
      component.close();

      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should call preventDefault on preventAction', () => {
      const fakeEvent = jasmine.createSpyObj('ClipboardEvent', [
        'preventDefault',
      ]);

      component.preventAction(fakeEvent);

      expect(fakeEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('without an existing configuration', () => {
    beforeEach(async () => {
      await setUp({ configurations: [] });

      fixture = TestBed.createComponent(NewConfigurationModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should leave existingConfiguration undefined', () => {
      expect(component.existingConfiguration).toBeUndefined();
    });

    it('should initialize the form with empty values', () => {
      expect(component.configurationForm.value).toEqual({
        configurationName: '',
        baseURL: '',
        apiKey: '',
        serviceProvider: '',
      });
    });

    it('should close the dialog with a null id when saving a valid new configuration', () => {
      component.configurationForm.setValue({
        configurationName: 'New Config',
        baseURL: 'https://new.example.com',
        apiKey: 'b'.repeat(32),
        serviceProvider: 3,
      });

      component.saveConfiguration();

      expect(mockDialogRef.close).toHaveBeenCalledWith(
        jasmine.objectContaining({ id: null })
      );
    });
  });

  describe('loadServiceProviders', () => {
    it('should populate serviceProviders on success', async () => {
      const providers: ServiceProviderModel[] = [
        {
          id: 1,
          name: 'Provider A',
          serviceProviderName: 'Provider A',
          serviceProviderLogo: '',
          audit: {},
        } as unknown as ServiceProviderModel,
      ];

      await setUp(mockData);
      mockServiceProvidersService.getAllServiceProviders.and.returnValue(
        of(providers)
      );

      fixture = TestBed.createComponent(NewConfigurationModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.serviceProviders).toEqual(providers);
    });

    it('should log the error and leave serviceProviders empty on failure', async () => {
      const error = new Error('load failed');
      const consoleErrorSpy = spyOn(console, 'error');

      await setUp(mockData);
      mockServiceProvidersService.getAllServiceProviders.and.returnValue(
        throwError(() => error)
      );

      fixture = TestBed.createComponent(NewConfigurationModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error while loading service providers',
        error
      );
      expect(component.serviceProviders).toEqual([]);
    });
  });
});
