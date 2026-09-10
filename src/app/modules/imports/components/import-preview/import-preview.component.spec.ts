import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImportPreviewComponent } from './import-preview.component';
import { ImportAnswersPreviewComponent } from './import-answers-preview/import-answers-preview.component';
import { of, throwError } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { DialogService } from '@core/services/dialog.service';
import { RouteDataService } from '@core/services/route-data.service';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { PollInstance } from '@core/models/poll-instance.model';
import { IMPORT_MESSAGES } from '@core/constants/messages';

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

@Component({
  selector: 'app-import-answers-preview',
  standalone: true,
  template: '',
})
class ImportAnswersPreviewStubComponent {
  @Input() evaluationId!: number;
  @Input() importedPollData!: PollInstance[];
  @Output() saveCompleted = new EventEmitter<{ state: string }>();
  @Output() cancelImport = new EventEmitter<void>();
}

describe('ImportPreviewComponent (additional scenarios)', () => {
  let component: ImportPreviewComponent;
  let fixture: ComponentFixture<ImportPreviewComponent>;
  let mockService: jasmine.SpyObj<CosmicLatteService>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockRouteDataService: jasmine.SpyObj<RouteDataService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;

  const defaultRouteData = {
    evaluationId: 1,
    pollName: 'Test Poll',
    startDate: '',
    endDate: '',
    configuration: { id: 1 } as ConfigurationsModel,
  };

  function initHappyPath() {
    mockRouteDataService.routeData.and.returnValue(defaultRouteData);
    mockService.importAnswerBySurvey.and.returnValue(of([]));
    mockDialogService.openDialog.and.returnValue(of({} as MatDialog));
    fixture.detectChanges();
    mockRouter.navigate.calls.reset();
    mockDialogService.openDialog.calls.reset();
  }

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('CosmicLatteService', [
      'importAnswerBySurvey',
    ]);
    mockDialogService = jasmine.createSpyObj('DialogService', ['openDialog']);
    mockRouteDataService = jasmine.createSpyObj('RouteDataService', [
      'routeData',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

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
    })
      .overrideComponent(ImportPreviewComponent, {
        remove: { imports: [ImportAnswersPreviewComponent] },
        add: { imports: [ImportAnswersPreviewStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ImportPreviewComponent);
    component = fixture.componentInstance;
    route = TestBed.inject(ActivatedRoute);
  });

  it('should navigate to the parent route when routeData is missing', () => {
    mockRouteDataService.routeData.and.returnValue(
      null as unknown as ReturnType<typeof mockRouteDataService.routeData>
    );

    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['../'], {
      relativeTo: route,
    });
    expect(mockService.importAnswerBySurvey).not.toHaveBeenCalled();
  });

  it('should set importedPollData and show the success dialog when data is returned', () => {
    const pollData: PollInstance[] = [{ id: 1 } as PollInstance];

    mockRouteDataService.routeData.and.returnValue(defaultRouteData);
    mockService.importAnswerBySurvey.and.returnValue(of(pollData));
    mockDialogService.openDialog.and.returnValue(of({} as MatDialog));

    fixture.detectChanges();

    expect(component.importedPollData).toEqual(pollData);
    expect(mockDialogService.openDialog).toHaveBeenCalledWith(
      IMPORT_MESSAGES.ANSWERS_PREVIEW_OK,
      'success'
    );
    expect(mockRouter.navigate).not.toHaveBeenCalledWith([
      '/evaluation-process',
    ]);
  });

  it('should navigate to /evaluation-process after the empty-data dialog closes', () => {
    mockRouteDataService.routeData.and.returnValue(defaultRouteData);
    mockService.importAnswerBySurvey.and.returnValue(of([]));
    mockDialogService.openDialog.and.returnValue(of({} as MatDialog));

    fixture.detectChanges();

    expect(mockDialogService.openDialog).toHaveBeenCalledWith(
      IMPORT_MESSAGES.ANSWERS_PREVIEW_EMPTY,
      'success'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/evaluation-process']);
  });

  it('should show an error dialog and stop loading when the import fails', () => {
    mockRouteDataService.routeData.and.returnValue(defaultRouteData);
    mockService.importAnswerBySurvey.and.returnValue(
      throwError(() => ({ error: { message: 'Something went wrong' } }))
    );

    fixture.detectChanges();

    expect(mockDialogService.openDialog).toHaveBeenCalledWith(
      IMPORT_MESSAGES.ANSWERS_ERROR,
      'error',
      'Something went wrong'
    );
    expect(component.loadingSubject.value).toBeFalse();
  });

  it('should mark isMobile true for narrow screens', () => {
    initHappyPath();

    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(500);
    component.checkScreenSize();

    expect(component.isMobile).toBeTrue();
  });

  it('should mark isMobile false for wide screens', () => {
    initHappyPath();

    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1024);
    component.checkScreenSize();

    expect(component.isMobile).toBeFalse();
  });

  it('should set loading true on a pending poll save state', () => {
    initHappyPath();

    component.handleSavePollState({ state: 'pending' });

    expect(component.loadingSubject.value).toBeTrue();
  });

  it('should reset state, show success dialog and navigate on successful poll save', () => {
    initHappyPath();
    mockDialogService.openDialog.and.returnValue(of({} as MatDialog));

    component.handleSavePollState({ state: 'true' });

    expect(component.loadingSubject.value).toBeFalse();
    expect(component.importedPollData).toEqual([]);
    expect(mockDialogService.openDialog).toHaveBeenCalledWith(
      'Polls saved successfully!',
      'success'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['evaluation-process']);
  });

  it('should show an error dialog with the message when poll save fails', () => {
    initHappyPath();

    component.handleSavePollState({
      state: 'false',
      data: { error: { message: 'Save failed' } },
    } as unknown as { state: string });

    expect(component.loadingSubject.value).toBeFalse();
    expect(mockDialogService.openDialog).toHaveBeenCalledWith(
      'Error saving polls. Please try again.',
      'error',
      'Save failed'
    );
  });

  it('should show a generic error dialog when poll save fails without a message', () => {
    initHappyPath();

    component.handleSavePollState({
      state: 'false',
    } as unknown as { state: string });

    expect(component.loadingSubject.value).toBeFalse();
    expect(mockDialogService.openDialog).toHaveBeenCalledWith(
      'Error saving polls. Please try again.',
      'error',
      undefined
    );
  });

  it('should navigate to evaluation-process on cancel', () => {
    initHappyPath();

    component.handleCancel();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['evaluation-process']);
  });
});
