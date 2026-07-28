import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ImportStatusComponent } from './import-status.component';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { DialogService } from '@core/services/dialog.service';
import {
  ImportJobStatusModel,
  ImportJobItem,
  ImportItemRow,
} from '@core/models/import-job.model';
import { QueuedImportResponse } from '@core/models/import-job.model';
import { EventAction } from '@core/models/load';
import { ActionData } from '@shared/components/list/types/action';
import { MatDialog } from '@angular/material/dialog';

function queuedResponse(): QueuedImportResponse {
  return { importJobId: 23, status: 'Importing' };
}

function eventAction(overrides: Partial<EventAction> = {}): EventAction {
  return {
    event: new Event('click'),
    item: {},
    data: { id: 'retry', columnId: 'actions', label: 'Retry' } as ActionData,
    ...overrides,
  };
}

describe('ImportStatusComponent', () => {
  let fixture: ComponentFixture<ImportStatusComponent>;
  let component: ImportStatusComponent;
  let clServiceSpy: jasmine.SpyObj<CosmicLatteService>;
  let toastSpy: jasmine.SpyObj<ToastNotificationService>;
  let dialogSpy: jasmine.SpyObj<DialogService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function baseStatus(
    overrides: Partial<ImportJobStatusModel> = {}
  ): ImportJobStatusModel {
    return {
      importJobId: 23,
      evaluationId: 1,
      status: 'Ready',
      totalCount: 2,
      processedCount: 0,
      extractedCount: 2,
      retryCount: 0,
      errorMessage: null,
      createdAtUtc: '2026-07-01T00:00:00Z',
      updatedAtUtc: '2026-07-01T00:00:00Z',
      ...overrides,
    };
  }

  function item(overrides: Partial<ImportJobItem> = {}): ImportJobItem {
    return {
      id: 1,
      importJobId: 23,
      studentEmail: 'john@example.com',
      studentName: 'John Doe',
      cohort: 'A',
      status: 'Extracted',
      retryCount: 0,
      isAlreadyImported: false,
      errorMessage: null,
      ...overrides,
    };
  }

  function create() {
    fixture = TestBed.createComponent(ImportStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    clServiceSpy = jasmine.createSpyObj('CosmicLatteService', [
      'getImportStatus',
      'getImportItems',
      'confirmImport',
      'retryImportItems',
    ]);
    toastSpy = jasmine.createSpyObj('ToastNotificationService', ['showToast']);
    dialogSpy = jasmine.createSpyObj('DialogService', ['openDialog']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    dialogSpy.openDialog.and.returnValue(of({} as MatDialog));
    clServiceSpy.getImportStatus.and.returnValue(of(baseStatus()));
    clServiceSpy.getImportItems.and.returnValue(of([item()]));

    await TestBed.configureTestingModule({
      imports: [ImportStatusComponent],
      providers: [
        { provide: CosmicLatteService, useValue: clServiceSpy },
        { provide: ToastNotificationService, useValue: toastSpy },
        { provide: DialogService, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '23' } } },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    create();
    expect(component).toBeTruthy();
  });

  it('should read importJobId from the route', () => {
    create();
    expect(component.importJobId).toBe(23);
  });

  it('should poll status and items on init and populate rows', fakeAsync(() => {
    create();
    tick();
    expect(clServiceSpy.getImportStatus).toHaveBeenCalledWith(23);
    expect(clServiceSpy.getImportItems).toHaveBeenCalledWith(23);
    expect(component.status?.status).toBe('Ready');
    expect(component.rows.length).toBe(1);
    expect(component.rows[0].name).toBe('John Doe');
  }));

  it('should stop polling once status leaves active states (Ready)', fakeAsync(() => {
    create();
    tick(3000);
    tick(3000);
    expect(clServiceSpy.getImportStatus).toHaveBeenCalledTimes(1);
  }));

  it('should keep polling while status is Extracting', fakeAsync(() => {
    clServiceSpy.getImportStatus.and.returnValue(
      of(baseStatus({ status: 'Extracting' }))
    );
    create();
    tick(3000);
    tick(3000);
    expect(clServiceSpy.getImportStatus).toHaveBeenCalledTimes(3);
  }));

  describe('empty poll handling (bug fix)', () => {
    beforeEach(() => {
      clServiceSpy.getImportStatus.and.returnValue(
        of(baseStatus({ totalCount: 0, extractedCount: 0 }))
      );
      clServiceSpy.getImportItems.and.returnValue(of([]));
    });

    it('should open the empty-data dialog when Ready with 0 items', fakeAsync(() => {
      create();
      tick();
      expect(dialogSpy.openDialog).toHaveBeenCalledTimes(1);
    }));

    it('should navigate back to evaluation-process when no data found', fakeAsync(() => {
      create();
      tick();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['evaluation-process']);
    }));

    it('should not open the dialog more than once across repeated polls', fakeAsync(() => {
      create();
      tick();
      tick(3000);
      expect(dialogSpy.openDialog).toHaveBeenCalledTimes(1);
    }));
  });

  it('should NOT open the empty-data dialog when Ready but items exist', fakeAsync(() => {
    create();
    tick();
    expect(dialogSpy.openDialog).not.toHaveBeenCalled();
  }));

  describe('progress getters', () => {
    it('showProgress should be true during Extracting', () => {
      create();
      component.status = baseStatus({ status: 'Extracting' });
      expect(component.showProgress).toBeTrue();
    });

    it('showProgress should be false when Ready', () => {
      create();
      component.status = baseStatus({ status: 'Ready' });
      expect(component.showProgress).toBeFalse();
    });

    it('progressMode should be determinate during Importing', () => {
      create();
      component.status = baseStatus({ status: 'Importing' });
      expect(component.progressMode).toBe('determinate');
    });

    it('progressMode should be indeterminate otherwise', () => {
      create();
      component.status = baseStatus({ status: 'Extracting' });
      expect(component.progressMode).toBe('indeterminate');
    });

    it('progressValue should compute percentage during Importing', () => {
      create();
      component.status = baseStatus({
        status: 'Importing',
        totalCount: 10,
        processedCount: 5,
      });
      expect(component.progressValue).toBe(50);
    });

    it('progressValue should be 0 when status is null', () => {
      create();
      component.status = null;
      expect(component.progressValue).toBe(0);
    });

    it('progressLabel should reflect Extracting state', () => {
      create();
      component.status = baseStatus({
        status: 'Extracting',
        extractedCount: 4,
      });
      expect(component.progressLabel).toContain('Extracting respondents');
      expect(component.progressLabel).toContain('4');
    });

    it('progressLabel should reflect Ready state', () => {
      create();
      component.status = baseStatus({ status: 'Ready', totalCount: 7 });
      expect(component.progressLabel).toContain('7 respondents extracted');
    });

    it('progressLabel should reflect Importing state', () => {
      create();
      component.status = baseStatus({
        status: 'Importing',
        processedCount: 3,
        totalCount: 10,
      });
      expect(component.progressLabel).toContain('Importing 3/10');
    });

    it('progressLabel should be empty when status is null', () => {
      create();
      component.status = null;
      expect(component.progressLabel).toBe('');
    });
  });

  describe('confirmImport', () => {
    it('should show error toast when nothing is selected', () => {
      create();
      component.rows = [];
      component.confirmImport();
      expect(toastSpy.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'error' })
      );
      expect(clServiceSpy.confirmImport).not.toHaveBeenCalled();
    });

    it('should call confirmImport with selected extracted ids', () => {
      clServiceSpy.confirmImport.and.returnValue(of(queuedResponse()));
      create();
      component.rows = [
        { id: 1, isSelected: true, status: 'Extracted' } as ImportItemRow,
        { id: 2, isSelected: false, status: 'Extracted' } as ImportItemRow,
      ];
      component.confirmImport();
      expect(clServiceSpy.confirmImport).toHaveBeenCalledWith(23, [1]);
      expect(toastSpy.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'success' })
      );
    });

    it('should show error toast when confirmImport fails', () => {
      clServiceSpy.confirmImport.and.returnValue(
        throwError(() => new Error('fail'))
      );
      create();
      component.rows = [
        { id: 1, isSelected: true, status: 'Extracted' } as ImportItemRow,
      ];
      component.confirmImport();
      expect(toastSpy.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'error', title: 'Import' })
      );
    });
  });

  describe('retry flow', () => {
    it('should show error toast when retrySelected has no failed items', () => {
      create();
      component.rows = [];
      component.retrySelected();
      expect(toastSpy.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'error', title: 'Retry' })
      );
    });

    it('should call retryImportItems with selected failed ids', () => {
      clServiceSpy.retryImportItems.and.returnValue(of(queuedResponse()));
      create();
      component.rows = [
        { id: 3, isSelected: true, status: 'Failed' } as ImportItemRow,
      ];
      component.retrySelected();
      expect(clServiceSpy.retryImportItems).toHaveBeenCalledWith(23, [3]);
      expect(toastSpy.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'success' })
      );
    });

    it('should retry a single item via onAction', () => {
      clServiceSpy.retryImportItems.and.returnValue(of(queuedResponse()));
      create();
      component.onAction(
        eventAction({
          item: { id: 7, status: 'Failed' } as ImportItemRow,
        })
      );
      expect(clServiceSpy.retryImportItems).toHaveBeenCalledWith(23, [7]);
    });

    it('should ignore onAction for actions other than retry', () => {
      create();
      component.onAction(
        eventAction({
          data: {
            id: 'something-else',
            columnId: 'actions',
            label: 'Other',
          } as ActionData,
          item: { id: 7, status: 'Failed' } as ImportItemRow,
        })
      );
      expect(clServiceSpy.retryImportItems).not.toHaveBeenCalled();
    });

    it('should show error toast when retryImportItems fails', () => {
      clServiceSpy.retryImportItems.and.returnValue(
        throwError(() => new Error('fail'))
      );
      create();
      component.rows = [
        { id: 3, isSelected: true, status: 'Failed' } as ImportItemRow,
      ];
      component.retrySelected();
      expect(toastSpy.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'error', title: 'Retry' })
      );
    });
  });

  describe('navigation', () => {
    it('goBack should navigate to evaluation-process', () => {
      create();
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['evaluation-process']);
    });
  });

  describe('selection counts', () => {
    it('confirmableCount should count selected+Extracted rows', () => {
      create();
      component.rows = [
        { isSelected: true, status: 'Extracted' } as ImportItemRow,
        { isSelected: false, status: 'Extracted' } as ImportItemRow,
        { isSelected: true, status: 'Failed' } as ImportItemRow,
      ];
      expect(component.confirmableCount).toBe(1);
    });

    it('selectedFailedCount should count selected+Failed rows', () => {
      create();
      component.rows = [
        { isSelected: true, status: 'Failed' } as ImportItemRow,
        { isSelected: true, status: 'Extracted' } as ImportItemRow,
      ];
      expect(component.selectedFailedCount).toBe(1);
    });
  });

  describe('isItemDisabled', () => {
    it('should require confirmable criteria during extraction phase', () => {
      create();
      component.status = baseStatus({ status: 'Ready' });
      const validRow = {
        status: 'Extracted',
        isAlreadyImported: false,
        name: 'John Doe',
        email: 'john@example.com',
      } as ImportItemRow;
      expect(component.isItemDisabled(validRow)).toBeFalse();
    });

    it('should disable rows with invalid email during extraction phase', () => {
      create();
      component.status = baseStatus({ status: 'Ready' });
      const invalidRow = {
        status: 'Extracted',
        isAlreadyImported: false,
        name: 'John Doe',
        email: 'not-an-email',
      } as ImportItemRow;
      expect(component.isItemDisabled(invalidRow)).toBeTrue();
    });

    it('should only enable Failed rows outside extraction phase', () => {
      create();
      component.status = baseStatus({ status: 'Importing' });
      const failedRow = { status: 'Failed' } as ImportItemRow;
      const otherRow = { status: 'Extracted' } as ImportItemRow;
      expect(component.isItemDisabled(failedRow)).toBeFalse();
      expect(component.isItemDisabled(otherRow)).toBeTrue();
    });
  });
});
