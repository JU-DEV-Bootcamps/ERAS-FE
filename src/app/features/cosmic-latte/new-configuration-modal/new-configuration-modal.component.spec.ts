import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewConfigurationModalComponent } from './new-configuration-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ServiceProvidersService } from '../../../core/services/api/service-providers.service';
import { ConfigurationsModel } from '../../../core/models/configurations.model';

describe('NewConfigurationModalComponent', () => {
  let component: NewConfigurationModalComponent;
  let fixture: ComponentFixture<NewConfigurationModalComponent>;
  let mockDialogRef: jasmine.SpyObj<
    MatDialogRef<NewConfigurationModalComponent>
  >;
  let mockServiceProvidersService: jasmine.SpyObj<ServiceProvidersService>;

  const mockData = {
    existingConfiguration: {
      id: 1,
      configurationName: 'Test Config',
      baseURL: 'https://example.com',
      encryptedKey: 'abc123',
      serviceProviderId: 2,
    } as ConfigurationsModel,
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockServiceProvidersService = jasmine.createSpyObj(
      'ServiceProvidersService',
      ['getAllServiceProviders']
    );
    mockServiceProvidersService.getAllServiceProviders.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [NewConfigurationModalComponent, ReactiveFormsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        {
          provide: ServiceProvidersService,
          useValue: mockServiceProvidersService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewConfigurationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with existing configuration data', () => {
    expect(component.configurationForm.value).toEqual({
      configurationName: 'Test Config',
      baseUrl: 'https://example.com',
      apiKey: 'abc123',
      serviceProvider: 2,
    });
  });

  it('should close the dialog with form data when form is valid', () => {
    component.configurationForm.setValue({
      configurationName: 'Updated Config',
      baseUrl: 'https://updated.com',
      apiKey: 'newkey',
      serviceProvider: 3,
    });

    component.saveConfiguration();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      configurationName: 'Updated Config',
      baseUrl: 'https://updated.com',
      apiKey: 'newkey',
      serviceProvider: 3,
      id: 1,
    });
  });

  it('should not close the dialog if form is invalid', () => {
    component.configurationForm.controls['configurationName'].setValue('');
    component.saveConfiguration();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close the dialog when close() is called', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
