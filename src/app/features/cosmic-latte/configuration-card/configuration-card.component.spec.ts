import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationCardComponent } from './configuration-card.component';
import { CosmicLatteService } from '../../../core/services/api/cosmic-latte.service';
import { ConfigurationsService } from '../../../core/services/api/configurations.service';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfigurationsModel } from '../../../core/models/configurations.model';
import { ServiceProviderModel } from '../../../core/models/service-providers.model';
import { of } from 'rxjs';
import { HealthCheckResponse } from '../../../core/models/cosmic-latte-request.model';

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
      baseUrl: 'https://example.com',
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
