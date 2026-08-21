import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import {
  AssessmentListComponent,
  AssessmentRowViewModel,
} from './assessment-list.component';
import {
  AssessmentModel,
  AssessmentStatus,
} from '@core/models/assessment.model';
import { AssessmentService } from '@core/services/api/assessement.service';
import { ModalDeleteConfirmationService } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.service';
import { ModalDeleteConfirmationComponent } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.component';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { NewInterventionModalComponent } from '../interventions/new-intervention-modal/new-intervention-modal.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AssessmentListComponent', () => {
  let component: AssessmentListComponent;
  let fixture: ComponentFixture<AssessmentListComponent>;

  let assessmentService: jasmine.SpyObj<AssessmentService>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let modalDeleteService: jasmine.SpyObj<ModalDeleteConfirmationService>;
  let toastService: jasmine.SpyObj<ToastNotificationService>;

  const buildAssessment = (
    overrides: Partial<AssessmentModel> = {}
  ): AssessmentModel => ({
    id: 1,
    createdAtUtc: '2026-03-30T00:00:00Z',
    createdBy: 'Roberto Alvarez',
    service: 'Student Services',
    assignedProfessional: 'Master',
    studentIds: ['12'],
    students: [
      { id: 12, name: 'Jane Doe', email: 'jane@mail.com', avgRiskLevel: 0 },
    ],
    comments: 'Some comment for preview testing',
    status: AssessmentStatus.Remitted,
    interventions: [],
    ...overrides,
  });

  beforeEach(async () => {
    assessmentService = jasmine.createSpyObj('AssessmentService', [
      'getAll',
      'deleteAssessment',
      'clearCache',
    ]);
    assessmentService.getAll.and.returnValue(of([buildAssessment()]));

    matDialog = jasmine.createSpyObj('MatDialog', ['open']);

    modalDeleteService = jasmine.createSpyObj(
      'ModalDeleteConfirmationService',
      ['confirmDelete']
    );

    toastService = jasmine.createSpyObj('ToastNotificationService', [
      'showToast',
    ]);

    await TestBed.configureTestingModule({
      imports: [AssessmentListComponent],
      providers: [
        { provide: AssessmentService, useValue: assessmentService },
        {
          provide: ModalDeleteConfirmationService,
          useValue: modalDeleteService,
        },
        { provide: ToastNotificationService, useValue: toastService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    TestBed.overrideProvider(MatDialog, { useValue: matDialog });

    fixture = TestBed.createComponent(AssessmentListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('loadAssessments', () => {
    it('should load and map assessments on success', () => {
      fixture.detectChanges();

      expect(assessmentService.getAll).toHaveBeenCalled();
      expect(component['assessments']().length).toBe(1);
      expect(component['isLoading']()).toBeFalse();
    });

    it('should fall back to "No student assigned" when studentIds is empty', () => {
      assessmentService.getAll.and.returnValue(
        of([buildAssessment({ studentIds: [] })])
      );

      fixture.detectChanges();

      expect(component['assessments']()[0].studentDisplay).toBe(
        'No student assigned'
      );
    });

    it('should truncate long comments in the preview', () => {
      const longComment = 'x'.repeat(80);
      assessmentService.getAll.and.returnValue(
        of([buildAssessment({ comments: longComment })])
      );

      fixture.detectChanges();

      const preview = component['assessments']()[0].commentPreview;
      expect(preview.endsWith('...')).toBeTrue();
      expect(preview.length).toBeLessThan(longComment.length);
    });

    it('should show "—" when there are no comments', () => {
      assessmentService.getAll.and.returnValue(
        of([buildAssessment({ comments: '' })])
      );

      fixture.detectChanges();

      expect(component['assessments']()[0].commentPreview).toBe('—');
    });

    it('should mark Remitted and InProgress as editable, Finalized as not', () => {
      assessmentService.getAll.and.returnValue(
        of([
          buildAssessment({ id: 1, status: AssessmentStatus.Remitted }),
          buildAssessment({ id: 2, status: AssessmentStatus.InProgress }),
          buildAssessment({ id: 3, status: AssessmentStatus.Finalized }),
        ])
      );

      fixture.detectChanges();

      const rows = component['assessments']();
      expect(rows[0].isEditable).toBeTrue();
      expect(rows[1].isEditable).toBeTrue();
      expect(rows[2].isEditable).toBeFalse();
    });

    it('should clear the list and stop loading on error', () => {
      spyOn(console, 'error');
      assessmentService.getAll.and.returnValue(
        throwError(() => new Error('network error'))
      );

      fixture.detectChanges();

      expect(component['assessments']()).toEqual([]);
      expect(component['isLoading']()).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('pagination', () => {
    it('should slice assessments according to pageIndex and pageSize', () => {
      const list = [
        buildAssessment({ id: 1 }),
        buildAssessment({ id: 2 }),
        buildAssessment({ id: 3 }),
      ];
      assessmentService.getAll.and.returnValue(of(list));
      component.pageSize = 2;

      fixture.detectChanges();

      expect(component['pagedAssessments']().length).toBe(2);

      component['onPageChange']({ pageIndex: 1 } as PageEvent);

      expect(component['pagedAssessments']().length).toBe(1);
    });
  });

  describe('output emitters', () => {
    beforeEach(() => fixture.detectChanges());

    it('should emit createClicked', () => {
      spyOn(component.createClicked, 'emit');
      component['onCreateClick']();
      expect(component.createClicked.emit).toHaveBeenCalled();
    });

    it('should emit viewClicked and set selectedAssessment', () => {
      spyOn(component.viewClicked, 'emit');
      const row = component['assessments']()[0];

      component['onViewClick'](row);

      expect(component.viewClicked.emit).toHaveBeenCalledWith(row);
      expect(component['selectedAssessment']()).toBe(row);
    });

    it('should close the detail panel', () => {
      component['selectedAssessment'].set(component['assessments']()[0]);

      component['closeDetailPanel']();

      expect(component['selectedAssessment']()).toBeNull();
    });

    it('should close and reload on closePanelRefreshing', () => {
      assessmentService.getAll.calls.reset();
      component['selectedAssessment'].set(component['assessments']()[0]);

      component['closePanelRefreshing']();

      expect(component['selectedAssessment']()).toBeNull();
      expect(assessmentService.getAll).toHaveBeenCalled();
    });

    it('should emit editClicked', () => {
      spyOn(component.editClicked, 'emit');
      const row = component['assessments']()[0];

      component['onEditClick'](row);

      expect(component.editClicked.emit).toHaveBeenCalledWith(row);
    });

    it('should emit moreClicked', () => {
      spyOn(component.moreClicked, 'emit');
      const row = component['assessments']()[0];

      component['onMoreClick'](row);

      expect(component.moreClicked.emit).toHaveBeenCalledWith(row);
    });
  });

  describe('onDeleteClick', () => {
    beforeEach(() => fixture.detectChanges());

    it('should do nothing when the item id is undefined', () => {
      component['onDeleteClick']({ ...buildAssessment(), id: undefined });
      expect(modalDeleteService.confirmDelete).not.toHaveBeenCalled();
    });

    it('should not delete when the confirmation is cancelled', () => {
      modalDeleteService.confirmDelete.and.returnValue({
        afterClosed: () => of(false),
      } as unknown as MatDialogRef<ModalDeleteConfirmationComponent>);

      component['onDeleteClick'](buildAssessment());

      expect(assessmentService.deleteAssessment).not.toHaveBeenCalled();
    });

    it('should delete, toast, clear cache and reload on success', () => {
      modalDeleteService.confirmDelete.and.returnValue({
        afterClosed: () => of(true),
      } as unknown as MatDialogRef<ModalDeleteConfirmationComponent>);
      const item = buildAssessment();
      assessmentService.deleteAssessment.and.returnValue(of(item));
      spyOn(component.deleteClicked, 'emit');

      component['onDeleteClick'](item);

      expect(assessmentService.deleteAssessment).toHaveBeenCalledWith(item.id!);
      expect(component.deleteClicked.emit).toHaveBeenCalledWith(item);
      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'success' })
      );
      expect(assessmentService.clearCache).toHaveBeenCalled();
    });

    it('should show a status-based error toast when deletion is rejected', () => {
      spyOn(console, 'error');
      modalDeleteService.confirmDelete.and.returnValue({
        afterClosed: () => of(true),
      } as unknown as MatDialogRef<ModalDeleteConfirmationComponent>);
      assessmentService.deleteAssessment.and.returnValue(
        throwError(() => ({ statusText: 'Bad Request' }))
      );
      const item = buildAssessment({ status: AssessmentStatus.Finalized });

      component['onDeleteClick'](item);

      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'error',
          message: jasmine.stringMatching('cannot be removed'),
        }),
        true
      );
      expect(component['isLoading']()).toBeFalse();
    });

    it('should show a not-found error toast for a Remitted item', () => {
      spyOn(console, 'error');
      modalDeleteService.confirmDelete.and.returnValue({
        afterClosed: () => of(true),
      } as unknown as MatDialogRef<ModalDeleteConfirmationComponent>);
      assessmentService.deleteAssessment.and.returnValue(
        throwError(() => ({ statusText: 'Not Found' }))
      );
      const item = buildAssessment({ status: AssessmentStatus.Remitted });

      component['onDeleteClick'](item);

      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          type: 'error',
          message: jasmine.stringMatching('was not found'),
        }),
        true
      );
    });
  });

  describe('onCreateIntervention', () => {
    it('should open NewInterventionModalComponent with mapped student options', () => {
      fixture.detectChanges();
      const row: AssessmentRowViewModel = {
        ...buildAssessment(),
        studentDisplay: '',
        commentPreview: '',
        isEditable: true,
      };

      component['onCreateIntervention'](row);

      expect(matDialog.open).toHaveBeenCalledWith(
        NewInterventionModalComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            assessmentId: row.id,
            students: [{ value: 12, label: 'Jane Doe', riskLevel: 0 }],
          }),
        })
      );
    });
  });
});
