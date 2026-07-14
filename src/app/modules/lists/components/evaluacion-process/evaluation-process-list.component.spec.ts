import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationProcessListComponent } from './evaluation-process-list.component';
import { provideHttpClient } from '@angular/common/http';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { EvaluationsService } from '@core/services/api/evaluations.service';
import { ActivatedRoute, Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { RouteDataService } from '@core/services/route-data.service';
import { EvaluationModel } from '@core/models/evaluation.model';
import { ActionDataWithCondition } from '@shared/components/list/types/action';

describe('EvaluationProcessListComponent', () => {
  let component: EvaluationProcessListComponent;
  let fixture: ComponentFixture<EvaluationProcessListComponent>;

  const mockEvaluationService = jasmine.createSpyObj(
    'EvaluationProcessService',
    ['createEvalProc', 'getAllEvalProc']
  );
  mockEvaluationService.getAllEvalProc.and.returnValue(
    of({ items: [], count: 0 })
  );

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => null,
      },
    },
    params: of({}),
    queryParams: of({}),
  };

  const mockRouter = jasmine.createSpyObj('Router', [
    'navigate',
    'serializeUrl',
    'createUrlTree',
  ]);
  mockRouter.events = of();

  const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

  const mockCosmicLatteService = jasmine.createSpyObj('CosmicLatteService', [
    'startExtraction',
  ]);

  const mockToastService = jasmine.createSpyObj('ToastNotificationService', [
    'showToast',
  ]);

  const mockFeatureFlagsService = jasmine.createSpyObj('FeatureFlagsService', [
    'isEnabled',
  ]);

  const mockRouteDataService = jasmine.createSpyObj('RouteDataService', [
    'updateRouteData',
  ]);

  const buildEvaluation = (
    overrides: Partial<EvaluationModel> = {}
  ): EvaluationModel =>
    ({
      id: 1,
      name: 'Test evaluation',
      status: 'Started',
      startDate: new Date(),
      endDate: new Date(),
      pollName: 'Test poll',
      country: 'BO',
      pollId: 1,
      configurationId: 1,
      evaluationPollId: 1,
      polls: [],
      pollInstances: [],
      latestImportJobId: null,
      ...overrides,
    }) as EvaluationModel;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationProcessListComponent],
      providers: [
        { provide: EvaluationsService, useValue: mockEvaluationService },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: CosmicLatteService, useValue: mockCosmicLatteService },
        { provide: ToastNotificationService, useValue: mockToastService },
        { provide: FeatureFlagsService, useValue: mockFeatureFlagsService },
        { provide: RouteDataService, useValue: mockRouteDataService },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
        { provide: Keycloak, useValue: {} },
        provideNoopAnimations(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationProcessListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockRouter.navigate.calls.reset();
    mockRouter.serializeUrl.calls.reset();
    mockRouter.createUrlTree.calls.reset();
    mockFeatureFlagsService.isEnabled.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('viewImport', () => {
    it('should navigate to import-status when latestImportJobId exists', () => {
      const evaluation = buildEvaluation({ latestImportJobId: 42 });

      component.viewImport(evaluation);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['import-status', 42], {
        relativeTo: mockActivatedRoute,
      });
    });

    it('should not navigate when latestImportJobId is null', () => {
      const evaluation = buildEvaluation({ latestImportJobId: null });

      component.viewImport(evaluation);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('viewImport action data', () => {
    it('should be disabled when the evaluation has no latestImportJobId', () => {
      const evaluation = buildEvaluation({ latestImportJobId: null });
      const viewImportAction = component.actionDatas.find(
        action => action.id === 'viewImport'
      ) as ActionDataWithCondition<EvaluationModel> | undefined;

      expect(viewImportAction?.isDisabled?.(evaluation)).toBeTrue();
    });

    it('should be enabled when the evaluation has a latestImportJobId', () => {
      const evaluation = buildEvaluation({ latestImportJobId: 42 });
      const viewImportAction = component.actionDatas.find(
        action => action.id === 'viewImport'
      ) as ActionDataWithCondition<EvaluationModel> | undefined;

      expect(viewImportAction?.isDisabled?.(evaluation)).toBeFalse();
    });

    it('should be visible only when reportsV2 feature flag is enabled', () => {
      const viewImportAction = component.actionDatas.find(
        action => action.id === 'viewImport'
      ) as ActionDataWithCondition<EvaluationModel> | undefined;

      mockFeatureFlagsService.isEnabled.and.returnValue(true);
      expect(viewImportAction?.isVisible?.(buildEvaluation())).toBeTrue();

      mockFeatureFlagsService.isEnabled.and.returnValue(false);
      expect(viewImportAction?.isVisible?.(buildEvaluation())).toBeFalse();
    });
  });

  describe('handleActionCalled', () => {
    it('should call viewImport when the viewImport action is triggered', () => {
      const evaluation = buildEvaluation({ latestImportJobId: 42 });
      spyOn(component, 'viewImport');

      component.handleActionCalled({
        data: { id: 'viewImport' },
        item: evaluation,
      } as never);

      expect(component.viewImport).toHaveBeenCalledWith(evaluation);
    });
  });
});
