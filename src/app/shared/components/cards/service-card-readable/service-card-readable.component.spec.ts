import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ServiceCardReadableComponent } from './service-card-readable.component';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ServiceCardReadableComponent', () => {
  let component: ServiceCardReadableComponent;
  let fixture: ComponentFixture<ServiceCardReadableComponent>;

  let configurationsServiceMock: jasmine.SpyObj<ConfigurationsService>;
  let serviceProvidersServiceMock: jasmine.SpyObj<ServiceProvidersService>;
  let userDataServiceMock: jasmine.SpyObj<UserDataService>;

  beforeEach(async () => {
    configurationsServiceMock = jasmine.createSpyObj('ConfigurationsService', [
      'getConfigurationsByUserId',
    ]);

    serviceProvidersServiceMock = jasmine.createSpyObj(
      'ServiceProvidersService',
      ['getAllServiceProviders']
    );

    userDataServiceMock = jasmine.createSpyObj('UserDataService', ['user']);

    await TestBed.configureTestingModule({
      imports: [ServiceCardReadableComponent],
      providers: [
        { provide: ConfigurationsService, useValue: configurationsServiceMock },
        {
          provide: ServiceProvidersService,
          useValue: serviceProvidersServiceMock,
        },
        { provide: UserDataService, useValue: userDataServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCardReadableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    userDataServiceMock.user.and.returnValue({ id: '123' });

    configurationsServiceMock.getConfigurationsByUserId.and.returnValue(
      of([
        {
          id: 1,
          userId: '1',
          configurationName: 'Test Config',
          baseURL: 'some/url',
          encryptedKey: 'abc',
          serviceProviderId: 1,
          isDeleted: false,
          audit: {
            createdBy: 'Admin',
            modifiedBy: 'Admin',
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        },
      ])
    );

    serviceProvidersServiceMock.getAllServiceProviders.and.returnValue(
      of([
        {
          id: 1,
          serviceProviderName: 'Provider Test',
          serviceProviderLogo: 'logo.png',
          audit: {
            createdBy: 'Admin',
            modifiedBy: 'Admin',
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        },
      ])
    );
    fixture.detectChanges();

    expect(component.userId).toBe('123');
    expect(component.serviceName).toBe('Test Config');
    expect(component.serviceProviderName).toBe('Provider Test');
    expect(component.serviceCreated).toBe('Admin');
  });

  it('should call services on init', () => {
    userDataServiceMock.user.and.returnValue({ id: '123' });

    configurationsServiceMock.getConfigurationsByUserId.and.returnValue(of([]));
    serviceProvidersServiceMock.getAllServiceProviders.and.returnValue(of([]));

    fixture.detectChanges();

    expect(
      configurationsServiceMock.getConfigurationsByUserId
    ).toHaveBeenCalledWith('123');
    expect(
      serviceProvidersServiceMock.getAllServiceProviders
    ).toHaveBeenCalled();
  });

  it('should handle empty configurations safely', () => {
    userDataServiceMock.user.and.returnValue({ id: '123' });

    configurationsServiceMock.getConfigurationsByUserId.and.returnValue(of([]));
    serviceProvidersServiceMock.getAllServiceProviders.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.configurations.length).toBe(0);
  });
});
