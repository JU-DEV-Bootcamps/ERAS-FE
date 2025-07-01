import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportAnswersComponent } from './import-answers.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import Keycloak from 'keycloak-js';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CosmicLatteService } from '../../core/services/api/cosmic-latte.service';
import { ConfigurationsService } from '../../core/services/api/configurations.service';
import { ServiceProvidersService } from '../../core/services/api/service-providers.service';
import { AuditModel } from '../../core/models/common/audit.model';
import { PollInstance } from '../../core/models/poll-instance.model';
import { ConfigurationsModel } from '../../core/models/configurations.model';

describe('ImportAnswersComponent', () => {
  let component: ImportAnswersComponent;
  let fixture: ComponentFixture<ImportAnswersComponent>;
  let mockService: jasmine.SpyObj<CosmicLatteService>;
  let mockKeycloak: jasmine.SpyObj<Keycloak>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('CosmicLatteService', [
      'importAnswerBySurvey',
      'getPollNames',
    ]);
    const mockConfigService = jasmine.createSpyObj('ConfigurationsService', [
      'getConfigurationsByUserId',
    ]);
    const mockSPService = jasmine.createSpyObj('ServiceProvidersService', [
      'getAllServiceProviders',
    ]);
    mockKeycloak = jasmine.createSpyObj('Keycloak', ['loadUserProfile']);
    const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockService.getPollNames.and.returnValue(of([]));
    mockKeycloak.loadUserProfile.and.resolveTo({ id: 'user123' });

    await TestBed.configureTestingModule({
      imports: [ImportAnswersComponent, ReactiveFormsModule],
      providers: [
        { provide: CosmicLatteService, useValue: mockService },
        { provide: ConfigurationsService, useValue: mockConfigService },
        { provide: ServiceProvidersService, useValue: mockSPService },
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
        { provide: DatePipe, useClass: DatePipe },
        provideNoopAnimations(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the form after a successful submission', () => {
    const audit: AuditModel = {
      createdBy: 'string',
      modifiedBy: 'string',
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    const poll: PollInstance[] = [
      {
        id: 0,
        idCosmicLatte: 'string',
        uuid: 'string',
        name: 'string',
        version: 'string',
        finishedAt: 'string',
        components: [],
        audit: audit,
      },
    ];

    component.selectedConfiguration = {
      id: 1,
      serviceProviderId: 1,
    } as ConfigurationsModel;

    component.form.controls['surveyName'].setValue('Test Survey');

    mockService.importAnswerBySurvey.and.returnValue(of(poll));

    component.onSubmit();

    expect(mockService.importAnswerBySurvey).toHaveBeenCalledWith(
      1,
      'Test Survey',
      null,
      null
    );

    expect(component.form.controls['surveyName'].value).toBe('');
    expect(component.form.pristine).toBeTrue();
    expect(component.form.untouched).toBeTrue();
  });

  it('should handle error on submission', () => {
    component.selectedConfiguration = {
      id: 1,
      serviceProviderId: 1,
    } as ConfigurationsModel;

    component.form.controls['surveyName'].setValue('Test Survey');

    mockService.importAnswerBySurvey.and.returnValue(
      throwError(() => ({ error: { message: 'Server error' } }))
    );

    component.onSubmit();

    expect(mockService.importAnswerBySurvey).toHaveBeenCalled();
    expect(component.form.controls['surveyName'].value).toBe('');
  });
});
