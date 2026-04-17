import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ServiceCardReadableComponent } from './service-card-readable.component';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';

describe('ServiceCardReadableComponent', () => {
  let component: ServiceCardReadableComponent;
  let fixture: ComponentFixture<ServiceCardReadableComponent>;
  let configurationsServiceMock: jasmine.SpyObj<ConfigurationsService>;
  let serviceProvidersServiceMock: jasmine.SpyObj<ServiceProvidersService>;
  let userDataServiceMock: jasmine.SpyObj<UserDataService>;
  let cosmicLatteServiceMock: jasmine.SpyObj<CosmicLatteService>;

  const mockUser = { id: '123' };
  const mockProviders = [
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
  ];
  const mockConfigurations = [
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
  ];

  beforeEach(async () => {
    configurationsServiceMock = jasmine.createSpyObj('ConfigurationsService', [
      'getConfigurationsByUserId',
    ]);
    serviceProvidersServiceMock = jasmine.createSpyObj(
      'ServiceProvidersService',
      ['getAllServiceProviders']
    );
    userDataServiceMock = jasmine.createSpyObj('UserDataService', ['user']);
    cosmicLatteServiceMock = jasmine.createSpyObj('CosmicLatteService', [
      'healthCheck',
    ]);

    await TestBed.configureTestingModule({
      imports: [ServiceCardReadableComponent],
      providers: [
        { provide: ConfigurationsService, useValue: configurationsServiceMock },
        {
          provide: ServiceProvidersService,
          useValue: serviceProvidersServiceMock,
        },
        { provide: UserDataService, useValue: userDataServiceMock },
        { provide: CosmicLatteService, useValue: cosmicLatteServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceCardReadableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    userDataServiceMock.user.and.returnValue(mockUser);
    configurationsServiceMock.getConfigurationsByUserId.and.returnValue(of([]));
    serviceProvidersServiceMock.getAllServiceProviders.and.returnValue(of([]));
    expect(component).toBeTruthy();
  });

  it('should set userId and call loadAllData on init', () => {
    userDataServiceMock.user.and.returnValue(mockUser);
    configurationsServiceMock.getConfigurationsByUserId.and.returnValue(of([]));
    serviceProvidersServiceMock.getAllServiceProviders.and.returnValue(of([]));

    spyOn(component, 'loadAllData');
    component.ngOnInit();

    expect(component.userId).toBe('123');
    expect(component.loadAllData).toHaveBeenCalled();
  });

  it('should call services with correct args on init', () => {
    userDataServiceMock.user.and.returnValue(mockUser);
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

  it('should build serviceCards correctly from configurations + providers + healthCheck', () => {
    userDataServiceMock.user.and.returnValue(mockUser);
    configurationsServiceMock.getConfigurationsByUserId.and.returnValue(
      of(mockConfigurations)
    );
    serviceProvidersServiceMock.getAllServiceProviders.and.returnValue(
      of(mockProviders)
    );
    cosmicLatteServiceMock.healthCheck.and.returnValue(
      of({ status: true, dateTime: 'dd/mm/yy' })
    );

    fixture.detectChanges();

    expect(component.serviceCards.length).toBe(1);
    expect(component.serviceCards[0]).toEqual({
      configurationName: 'Test Config',
      serviceProviderName: 'Provider Test',
      createdBy: 'Admin',
      isActive: true,
    });
  });

  it('should set isLoading to false after data loads', () => {
    userDataServiceMock.user.and.returnValue(mockUser);
    configurationsServiceMock.getConfigurationsByUserId.and.returnValue(
      of(mockConfigurations)
    );
    serviceProvidersServiceMock.getAllServiceProviders.and.returnValue(
      of(mockProviders)
    );
    cosmicLatteServiceMock.healthCheck.and.returnValue(
      of({ status: true, dateTime: 'dd/mm/yy' })
    );

    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
  });

  it('should handle empty configurations without calling healthCheck', () => {
    userDataServiceMock.user.and.returnValue(mockUser);
    configurationsServiceMock.getConfigurationsByUserId.and.returnValue(of([]));
    serviceProvidersServiceMock.getAllServiceProviders.and.returnValue(of([]));

    fixture.detectChanges();

    expect(cosmicLatteServiceMock.healthCheck).not.toHaveBeenCalled();
    expect(component.serviceCards.length).toBe(0);
  });

  // it('should default isActive to false when healthCheck returns null status', () => {
  //   userDataServiceMock.user.and.returnValue(mockUser);
  //   configurationsServiceMock.getConfigurationsByUserId.and.returnValue(of(mockConfigurations));
  //   serviceProvidersServiceMock.getAllServiceProviders.and.returnValue(of(mockProviders));
  //   cosmicLatteServiceMock.healthCheck.and.returnValue(of(null));

  //   fixture.detectChanges();

  //   expect(component.serviceCards[0].isActive).toBeFalse();
  // });
});
