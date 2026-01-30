import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportPreviewComponent } from './import-preview.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { UserDataService } from '@core/services/access/user-data.service';

describe('ImportAnswersComponent', () => {
  let component: ImportPreviewComponent;
  let fixture: ComponentFixture<ImportPreviewComponent>;
  let mockService: jasmine.SpyObj<CosmicLatteService>;
  let mockUserData: jasmine.SpyObj<UserDataService>;

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
    const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockUserData = jasmine.createSpyObj('UserDataService', ['user']);
    mockUserData.user.and.returnValue({ id: 'user123' });

    mockService.getPollNames.and.returnValue(of([]));
    mockConfigService.getConfigurationsByUserId.and.returnValue(of([]));
    mockSPService.getAllServiceProviders.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ImportPreviewComponent, ReactiveFormsModule],
      providers: [
        { provide: CosmicLatteService, useValue: mockService },
        { provide: ConfigurationsService, useValue: mockConfigService },
        { provide: ServiceProvidersService, useValue: mockSPService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
        { provide: DatePipe, useClass: DatePipe },
        { provide: UserDataService, useValue: mockUserData },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: 123 }),
            snapshot: { paramMap: { get: () => '123' } },
          },
        },
        provideNoopAnimations(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
