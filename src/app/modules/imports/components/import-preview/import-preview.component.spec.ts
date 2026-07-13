import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportPreviewComponent } from './import-preview.component';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { DialogService } from '@core/services/dialog.service';
import { RouteDataService } from '@core/services/route-data.service';
import { ConfigurationsModel } from '@core/models/configurations.model';

describe('ImportPreviewComponent', () => {
  let component: ImportPreviewComponent;
  let fixture: ComponentFixture<ImportPreviewComponent>;
  let mockService: jasmine.SpyObj<CosmicLatteService>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockRouteDataService: jasmine.SpyObj<RouteDataService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('CosmicLatteService', [
      'importAnswerBySurvey',
    ]);
    mockDialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
    mockRouteDataService = jasmine.createSpyObj('RouteDataService', [
      'routeData',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockService.importAnswerBySurvey.and.returnValue(of([]));
    mockDialogService.openDialog.and.returnValue(of({} as MatDialog));
    mockRouteDataService.routeData.and.returnValue({
      evaluationId: 1,
      pollName: 'Test Poll',
      startDate: '',
      endDate: '',
      configuration: { id: 1 } as ConfigurationsModel,
    });

    await TestBed.configureTestingModule({
      imports: [ImportPreviewComponent],
      providers: [
        { provide: CosmicLatteService, useValue: mockService },
        { provide: DialogService, useValue: mockDialogService },
        { provide: RouteDataService, useValue: mockRouteDataService },
        { provide: Router, useValue: mockRouter },
        { provide: DatePipe, useClass: DatePipe },
        {
          provide: ActivatedRoute,
          useValue: {
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

  it('should call importAnswerBySurvey with routeData values', () => {
    expect(mockService.importAnswerBySurvey).toHaveBeenCalledWith(
      1,
      'Test Poll',
      '',
      ''
    );
  });
});
