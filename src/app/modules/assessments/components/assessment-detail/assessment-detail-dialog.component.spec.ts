import { AssessmentService } from '@core/services/api/assessement.service';
import { AssessmentDetailDialogComponent } from './assessment-detail-dialog.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { ModalDeleteConfirmationService } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { AssessmentStatus } from '@core/models/assessment.model';
import { ModalDeleteConfirmationComponent } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.component';

describe('AssessmentDetailDialogComponent', () => {
  let component: AssessmentDetailDialogComponent;
  let fixture: ComponentFixture<AssessmentDetailDialogComponent>;

  let dialog: jasmine.SpyObj<MatDialog>;
  let featureFlags: jasmine.SpyObj<FeatureFlagsService>;
  let modalDeleteService: jasmine.SpyObj<ModalDeleteConfirmationService>;
  let assessmentService: jasmine.SpyObj<AssessmentService>;
  let toastService: jasmine.SpyObj<ToastNotificationService>;

  beforeEach(async () => {
    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    featureFlags = jasmine.createSpyObj('FeatureFlagsService', ['isEnabled']);

    modalDeleteService = jasmine.createSpyObj(
      'ModalDeleteConfirmationService',
      ['confirmDelete']
    );

    assessmentService = jasmine.createSpyObj('AssessmentService', [
      'editAssessment',
      'clearCache',
    ]);

    toastService = jasmine.createSpyObj('ToastNotificationService', [
      'showToast',
    ]);

    await TestBed.configureTestingModule({
      imports: [AssessmentDetailDialogComponent],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: FeatureFlagsService, useValue: featureFlags },
        {
          provide: ModalDeleteConfirmationService,
          useValue: modalDeleteService,
        },
        { provide: AssessmentService, useValue: assessmentService },
        { provide: ToastNotificationService, useValue: toastService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentDetailDialogComponent);
    component = fixture.componentInstance;

    component.data = {
      id: 1,
      createdAtUtc: '',
      createdBy: '',
      service: '',
      studentIds: ['10', '11'],
      status: AssessmentStatus.Remitted,
      interventions: [],
      studentDisplay: '',
      commentPreview: '',
      isEditable: true,
      students: [
        {
          id: 10,
          name: 'string',
          email: 'string',
        },
        {
          id: 11,
          name: 'string',
          email: 'string',
        },
      ],
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close', () => {
    spyOn(component.close, 'emit');

    component.onClose();

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit closeRefresh', () => {
    spyOn(component.closeRefresh, 'emit');

    component.onCloseRefresh();

    expect(component.closeRefresh.emit).toHaveBeenCalled();
  });

  it('should emit createIntervention', () => {
    spyOn(component.createIntervention, 'emit');

    component.onCreateIntervention();

    expect(component.createIntervention.emit).toHaveBeenCalledWith(
      component.data
    );
  });

  it('should call openStudentDetails from action', () => {
    spyOn(component, 'openStudentDetails');

    component.onActionCalled({
      data: {
        id: 'openStudentDetails',
        ngIconName: '',
        label: '',
        columnId: '',
      },
      item: { id: 10 },
      event: new Event('click'),
    });

    expect(component.openStudentDetails).toHaveBeenCalledWith(10);
  });

  it('should call onDeleteStudent from action', () => {
    spyOn(component, 'onDeleteStudent');

    component.onActionCalled({
      data: {
        id: 'removeStudent',
        ngIconName: '',
        label: '',
        columnId: '',
      },
      item: { id: 10 },
      event: new Event('click'),
    });
    expect(component['onDeleteStudent']).toHaveBeenCalledWith(10);
  });

  it('should open V2 student details when feature flag enabled', () => {
    featureFlags.isEnabled.and.returnValue(true);

    component.openStudentDetails(15);

    expect(dialog.open).toHaveBeenCalledWith(
      ModalStudentDetailV2Component,
      jasmine.objectContaining({
        data: { studentId: 15 },
      })
    );
  });

  it('should open legacy student details when feature flag disabled', () => {
    featureFlags.isEnabled.and.returnValue(false);

    component.openStudentDetails(20);

    expect(dialog.open).toHaveBeenCalledWith(
      ModalStudentDetailComponent,
      jasmine.objectContaining({
        data: { studentId: 20 },
      })
    );
  });

  it('should not delete if only one student exists', () => {
    component.data.students = [{ id: 1, name: '', email: '' }];

    component['onDeleteStudent'](1);

    expect(modalDeleteService.confirmDelete).not.toHaveBeenCalled();
  });

  it('should not delete if assessment id is undefined', () => {
    component.data.id = undefined;

    component['onDeleteStudent'](1);

    expect(modalDeleteService.confirmDelete).not.toHaveBeenCalled();
  });

  it('should not call editAssessment when confirmation is cancelled', () => {
    modalDeleteService.confirmDelete.and.returnValue({
      afterClosed: () => of(false),
    } as unknown as MatDialogRef<ModalDeleteConfirmationComponent>);

    component['onDeleteStudent'](1);

    expect(assessmentService.editAssessment).not.toHaveBeenCalled();
  });

  it('should remove student successfully', () => {
    modalDeleteService.confirmDelete.and.returnValue({
      afterClosed: () => of(true),
    } as unknown as MatDialogRef<ModalDeleteConfirmationComponent>);
    assessmentService.editAssessment.and.returnValue(
      of({
        id: 1,
        createdAtUtc: '',
        createdBy: '',
        service: '',
        studentIds: ['1'],
        status: AssessmentStatus.Remitted,
        interventions: [],
        students: [],
      })
    );

    spyOn(component, 'onCloseRefresh');

    component['onDeleteStudent'](1);

    expect(assessmentService.editAssessment).toHaveBeenCalled();

    expect(toastService.showToast).toHaveBeenCalled();

    expect(assessmentService.clearCache).toHaveBeenCalled();

    expect(component.onCloseRefresh).toHaveBeenCalled();
  });
});
