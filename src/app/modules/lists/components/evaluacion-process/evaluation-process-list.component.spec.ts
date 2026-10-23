import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationProcessListComponent } from './evaluation-process-list.component';
import { provideHttpClient } from '@angular/common/http';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { EvaluationsService } from '@core/services/api/evaluations.service';
import { ActivatedRoute, Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { RouteDataService } from '@core/services/route-data.service';
import { EvaluationModel } from '@core/models/evaluation.model';
import { ActionDataWithCondition } from '@shared/components/list/types/action';
import { ModalComponent } from '@shared/components/modals/modal-dialog/modal-dialog.component';
import { Status } from '@core/constants/common';
import {
  STATUS_COLORS,
  STATUS_EVALUATIONS,
  STATUS_LABEL_COLORS,
  TOOLTIP_EVALUATIONS,
} from '@core/constants/StatusEvaluation';

describe('EvaluationProcessListComponent', () => {
  let component: EvaluationProcessListComponent;
  let fixture: ComponentFixture<EvaluationProcessListComponent>;

  const mockEvaluationService = jasmine.createSpyObj(
    'EvaluationProcessService',
    ['createEvalProc', 'getAllEvalProc', 'deleteEvaluationProcess']
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
    mockEvaluationService.getAllEvalProc.and.returnValue(
      of({ items: [], count: 0 })
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set isMobile to true when the initial window width is under 600', () => {
      const originalWidth = window.innerWidth;
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 500,
      });

      component.ngOnInit();

      expect(component.isMobile).toBeTrue();

      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalWidth,
      });
    });
  });

  describe('onResize', () => {
    it('should set isMobile to true when width is under 600', () => {
      component.onResize({
        target: { innerWidth: 500 },
      } as unknown as UIEvent);

      expect(component.isMobile).toBeTrue();
    });

    it('should set isMobile to false when width is 600 or more', () => {
      component.onResize({
        target: { innerWidth: 900 },
      } as unknown as UIEvent);

      expect(component.isMobile).toBeFalse();
    });
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

  describe('goImport action data', () => {
    it('should be disabled when the evaluation has no pollName', () => {
      const evaluation = buildEvaluation({ pollName: '' });
      const goImportAction = component.actionDatas.find(
        action => action.id === 'goImport'
      ) as ActionDataWithCondition<EvaluationModel> | undefined;

      expect(goImportAction?.isDisabled?.(evaluation)).toBeTrue();
    });

    it('should be enabled when the evaluation has a pollName', () => {
      const evaluation = buildEvaluation({ pollName: 'Test Poll Name' });
      const goImportAction = component.actionDatas.find(
        action => action.id === 'goImport'
      ) as ActionDataWithCondition<EvaluationModel> | undefined;

      expect(goImportAction?.isDisabled?.(evaluation)).toBeFalse();
    });

    it('should not be visible when evaluation status is incomplete', () => {
      const evaluation = buildEvaluation({ status: Status.INCOMPLETE });
      const goImportAction = component.actionDatas.find(
        action => action.id === 'goImport'
      ) as ActionDataWithCondition<EvaluationModel> | undefined;

      expect(goImportAction!.isVisible!(evaluation)).toBeFalse();
    });

    it('should not be visible when evaluation status is not started', () => {
      const evaluation = buildEvaluation({ status: Status.NOT_STARTED });
      const goImportAction = component.actionDatas.find(
        action => action.id === 'goImport'
      ) as ActionDataWithCondition<EvaluationModel> | undefined;

      expect(goImportAction!.isVisible!(evaluation)).toBeFalse();
    });

    it('should be visible when evaluation status is in progress', () => {
      const evaluation = buildEvaluation({ status: Status.IN_PROGRESS });
      const goImportAction = component.actionDatas.find(
        action => action.id === 'goImport'
      ) as ActionDataWithCondition<EvaluationModel> | undefined;

      expect(goImportAction!.isVisible!(evaluation)).toBeTrue();
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

    it('should do nothing when the action id is not recognized', () => {
      spyOn(component, 'viewImport');
      spyOn(component, 'openModalDetails');
      spyOn(component, 'goToImport');

      expect(() =>
        component.handleActionCalled({
          data: { id: 'unknownAction' },
          item: buildEvaluation(),
        } as never)
      ).not.toThrow();

      expect(component.viewImport).not.toHaveBeenCalled();
      expect(component.openModalDetails).not.toHaveBeenCalled();
      expect(component.goToImport).not.toHaveBeenCalled();
    });
  });

  describe('deleteEvaluationConfirmation', () => {
    it('should delete the evaluation when the dialog is confirmed', () => {
      const dialogRefSpy = {
        afterClosed: () => of(true),
      };
      mockDialog.open.and.returnValue(
        dialogRefSpy as MatDialogRef<ModalComponent>
      );
      spyOn(component, 'deleteEvaluation');
      component.deleteEvaluationConfirmation(123);
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should pass a delete callback to the dialog', () => {
      spyOn(component, 'deleteEvaluation');

      component.deleteEvaluationConfirmation(123);

      const [, config] = mockDialog.open.calls.mostRecent().args;

      config.data.action.action();

      expect(component.deleteEvaluation).toHaveBeenCalledWith(123);
    });
  });

  describe('deleteEvaluation', () => {
    it('should show a success alert and refresh the list when deletion succeeds', () => {
      mockEvaluationService.deleteEvaluationProcess.and.returnValue(of({}));
      spyOn(component, 'openAlertDialog');
      spyOn(component, 'getEvaluationProcess');

      component.deleteEvaluation(123);

      expect(
        mockEvaluationService.deleteEvaluationProcess
      ).toHaveBeenCalledWith('123');
      expect(component.openAlertDialog).toHaveBeenCalledWith(
        'Evaluation deleted! ',
        'success'
      );
      expect(component.getEvaluationProcess).toHaveBeenCalled();
    });

    it('should show an error alert when deletion fails', () => {
      mockEvaluationService.deleteEvaluationProcess.and.returnValue(
        throwError(() => ({ message: 'Not found' }))
      );
      spyOn(component, 'openAlertDialog');

      component.deleteEvaluation(123);

      expect(component.openAlertDialog).toHaveBeenCalledWith(
        'Error: An error occurred while trying to delete the new evaluation process : Not found',
        'error'
      );
    });
  });

  describe('getEvaluationProcess', () => {
    it('should show an error alert and stop loading when the request fails', () => {
      mockEvaluationService.getAllEvalProc.and.returnValue(
        throwError(() => ({ message: 'Network error' }))
      );
      spyOn(component, 'openAlertDialog');

      component.getEvaluationProcess();

      expect(component.openAlertDialog).toHaveBeenCalledWith(
        'Error: An error occurred while trying to access information : Network error',
        'error'
      );
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('openAlertDialog', () => {
    it('should open the modal without an action when no deleteConfirmFunction is passed', () => {
      component.openAlertDialog('Something happened', 'success');

      const [, config] = mockDialog.open.calls.mostRecent().args;

      expect(config.data.action).toBeUndefined();
    });

    it('should open the modal with a delete action when deleteConfirmFunction is passed', () => {
      const deleteFn = jasmine.createSpy('deleteFn');
      component.openAlertDialog('Are you sure?', 'warning', deleteFn);

      const [, config] = mockDialog.open.calls.mostRecent().args;

      expect(config.data.action.action).toBe(deleteFn);
    });
  });

  describe('adaptDataToColumNames', () => {
    it('should uppercase the country and keep an existing pollName', () => {
      const evaluation = buildEvaluation({
        country: 'bo',
        pollName: 'Existing poll',
      });

      const [result] = component.adaptDataToColumNames([evaluation]);

      expect(result.country).toBe('BO');
      expect(result.pollName).toBe('Existing poll');
    });

    it('should default pollName when it is null', () => {
      const evaluation = buildEvaluation({
        country: 'bo',
        pollName: null as unknown as string,
      });

      const [result] = component.adaptDataToColumNames([evaluation]);

      expect(result.pollName).toBe('Not selected yet');
    });
  });

  describe('transformStatus', () => {
    it('should return the data unchanged when displayV2 is enabled', () => {
      spyOn(component, 'displayV2').and.returnValue(true);
      const rawStatus = 'RawStatus' as unknown as EvaluationModel['status'];
      const evaluation = buildEvaluation({ status: rawStatus });

      const result = component.transformStatus([evaluation]);

      expect(result[0].status).toBe(rawStatus);
    });

    it('should recompute the status when displayV2 is disabled', () => {
      spyOn(component, 'displayV2').and.returnValue(false);
      const rawStatus = 'RawStatus' as unknown as EvaluationModel['status'];

      const evaluation = buildEvaluation({
        status: rawStatus,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const [result] = component.transformStatus([evaluation]);

      expect(result.status).not.toBe(rawStatus);
      expect(result.status).toBe(Status.IN_PROGRESS);
    });
  });

  describe('status display helpers', () => {
    it('should fall back to the default entries for an unknown status', () => {
      expect(component.getStatusLabel('unknown-status')).toBe(
        STATUS_EVALUATIONS['default']
      );
      expect(component.getStatusTooltip('unknown-status')).toBe(
        TOOLTIP_EVALUATIONS['default']
      );
      expect(component.getStatusColor('unknown-status')).toBe(
        STATUS_COLORS['default']
      );
      expect(component.getStatusLabelColor('unknown-status')).toBe(
        STATUS_LABEL_COLORS['default']
      );
    });

    it('should return the mapped entry for a known status', () => {
      const knownStatus = Object.keys(STATUS_EVALUATIONS).find(
        key => key !== 'default'
      ) as string;

      expect(component.getStatusLabel(knownStatus)).toBe(
        STATUS_EVALUATIONS[knownStatus]
      );
    });
  });

  describe('_updatePaginator', () => {
    const callUpdatePaginator = () =>
      (
        component as unknown as { _updatePaginator: () => void }
      )._updatePaginator();

    it('should decrement the page when it falls out of range after deleting', () => {
      component.totalEvaluations = 11;
      component.pagination = { page: 1, pageSize: 10 };

      callUpdatePaginator();

      expect(component.totalEvaluations).toBe(10);
      expect(component.pagination.page).toBe(0);
    });

    it('should keep the page when it is still in range', () => {
      component.totalEvaluations = 25;
      component.pagination = { page: 1, pageSize: 10 };

      callUpdatePaginator();

      expect(component.totalEvaluations).toBe(24);
      expect(component.pagination.page).toBe(1);
    });

    it('should not decrement below page 0', () => {
      component.totalEvaluations = 1;
      component.pagination = { page: 0, pageSize: 10 };

      callUpdatePaginator();

      expect(component.totalEvaluations).toBe(0);
      expect(component.pagination.page).toBe(0);
    });
  });

  describe('goToImport', () => {
    it('should navigate to the import-status after extraction succeeds', () => {
      const evaluation = buildEvaluation({ latestImportJobId: 42 });

      const selectedPoll = {
        pollName: 'Poll 1',
        startDate: new Date(),
        endDate: new Date(),
        configuration: {
          userId: '534da',
          configurationName: 'a',
          baseURL: 'url',
          encryptedKey: '1ffc',
          id: 4,
          isDeleted: false,
          serviceProvider: null,
          serviceProviderId: 1,
        },
        pollId: 'm0cK1D',
      };

      mockDialog.open.and.returnValue({
        afterClosed: () => of(selectedPoll),
      });
      mockFeatureFlagsService.isEnabled.and.returnValue(true);

      mockCosmicLatteService.startExtraction.and.returnValue(
        of({ importJobId: 12 })
      );
      component.goToImport(evaluation);
      expect(mockCosmicLatteService.startExtraction).toHaveBeenCalledWith({
        evaluationSetName: 'Poll 1',
        configurationId: 4,
        startDate: selectedPoll.startDate,
        endDate: selectedPoll.endDate,
        evaluationId: evaluation.id,
        pollId: selectedPoll.pollId,
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['import-status', 12], {
        relativeTo: mockActivatedRoute,
      });
    });
    it('should return when the result is empty', () => {
      const evaluation = buildEvaluation({ latestImportJobId: 42 });

      mockDialog.open.and.returnValue({
        afterClosed: () => of(null),
      });
      mockFeatureFlagsService.isEnabled.and.returnValue(true);

      mockCosmicLatteService.startExtraction.and.returnValue(
        of({ importJobId: 12 })
      );
      component.goToImport(evaluation);
      expect(mockDialog.open).toHaveBeenCalled();
    });
    it('should navigate to the import-preview after for v1 enabled', () => {
      const evaluation = buildEvaluation({ latestImportJobId: 42 });

      const selectedPoll = {
        pollName: 'Poll 1',
        startDate: new Date(),
        endDate: new Date(),
        configuration: {
          userId: '534da',
          configurationName: 'a',
          baseURL: 'url',
          encryptedKey: '1ffc',
          id: 4,
          isDeleted: false,
          serviceProvider: null,
          serviceProviderId: 1,
        },
      };

      mockDialog.open.and.returnValue({
        afterClosed: () => of(selectedPoll),
      });
      mockFeatureFlagsService.isEnabled.and.returnValue(false);

      component.goToImport(evaluation);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['import-preview'], {
        relativeTo: mockActivatedRoute,
      });
    });
    it('should show import toast failed when extraction returns 400', () => {
      const evaluation = buildEvaluation();

      const selectedPoll = {
        pollName: 'Poll 1',
        startDate: new Date(),
        endDate: new Date(),
        configuration: {
          userId: '534da',
          configurationName: 'a',
          baseURL: 'url',
          encryptedKey: '1ffc',
          id: 4,
          isDeleted: false,
          serviceProvider: null,
          serviceProviderId: 1,
        },
      };

      mockDialog.open.and.returnValue({
        afterClosed: () => of(selectedPoll),
      });
      mockFeatureFlagsService.isEnabled.and.returnValue(true);

      mockCosmicLatteService.startExtraction.and.returnValue(
        throwError(() => ({
          status: 400,
          error: {
            message: 'Poll without answers',
          },
        }))
      );
      component.goToImport(evaluation);
      expect(mockToastService.showToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Import failed',
        message: 'Poll without answers',
      });
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
    it('should show import toast failed when extraction returns 500', () => {
      const evaluation = buildEvaluation();

      const selectedPoll = {
        pollName: 'Poll 1',
        startDate: new Date(),
        endDate: new Date(),
        configuration: {
          userId: '534da',
          configurationName: 'a',
          baseURL: 'url',
          encryptedKey: '1ffc',
          id: 4,
          isDeleted: false,
          serviceProvider: null,
          serviceProviderId: 1,
        },
      };

      mockDialog.open.and.returnValue({
        afterClosed: () => of(selectedPoll),
      });
      mockFeatureFlagsService.isEnabled.and.returnValue(true);

      mockCosmicLatteService.startExtraction.and.returnValue(
        throwError(() => ({
          status: 500,
          error: {
            message: 'Could not start the import extraction.',
          },
        }))
      );
      component.goToImport(evaluation);
      expect(mockToastService.showToast).toHaveBeenCalledWith({
        type: 'error',
        title: 'Import',
        message: 'Could not start the import extraction.',
      });
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
