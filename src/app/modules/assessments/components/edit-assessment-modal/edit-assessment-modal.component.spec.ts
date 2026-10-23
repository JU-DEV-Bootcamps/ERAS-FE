import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, of, throwError } from 'rxjs';

import { EditAssessmentModalComponent } from './edit-assessment-modal.component';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { AssessmentService } from '@core/services/api/assessement.service';
import {
  AssessmentModel,
  AssessmentStatus,
} from '@core/models/assessment.model';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { AssessmentModalData } from '@modules/assessments/models/assessments.interfaces';

describe('EditAssessmentModalComponent', () => {
  let component: EditAssessmentModalComponent;
  let fixture: ComponentFixture<EditAssessmentModalComponent>;

  let assessmentService: jasmine.SpyObj<AssessmentService>;
  let toastService: jasmine.SpyObj<ToastNotificationService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EditAssessmentModalComponent>>;
  let unsavedChangesGuard: jasmine.SpyObj<UnsavedChangesGuardService>;

  const assessment: AssessmentModel = {
    id: 1,
    createdAtUtc: '2026-01-01',
    assignedProfessional: 'John',
    comments: 'comment',
    service: 'Speech',
    studentIds: ['1'],
    createdBy: 'Admin',
    status: AssessmentStatus.Remitted,
    interventions: [],
  };

  const dialogData: AssessmentModalData = {
    assessment,
    students: [
      {
        label: 'Student One',
        value: 1,
      },
      {
        label: 'Student Two',
        value: 2,
      },
    ],
    profiles: [
      {
        label: 'Admin',
        value: 'Admin',
      },
    ],
    services: [
      {
        label: 'Speech',
        value: 'Speech',
      },
    ],
    professionals: [
      {
        label: 'John',
        value: 'John',
      },
    ],
  };

  const createForm = (overrides: Record<string, unknown> = {}) =>
    new FormGroup({
      date: new FormControl(
        overrides['date'] ?? '2026-01-01',
        Validators.required
      ),
      submitter: new FormControl(
        overrides['submitter'] ?? 'Admin',
        Validators.required
      ),
      service: new FormControl(
        overrides['service'] ?? 'Speech',
        Validators.required
      ),
      professional: new FormControl(
        overrides['professional'] ?? 'John',
        Validators.required
      ),
      students: new FormControl(
        overrides['students'] ?? ['1'],
        Validators.required
      ),
      professionalComment: new FormControl(
        overrides['professionalComment'] ?? 'comment'
      ),
      status: new FormControl(
        overrides['status'] ?? AssessmentStatus.Remitted,
        Validators.required
      ),
    });

  beforeEach(async () => {
    assessmentService = jasmine.createSpyObj('AssessmentService', [
      'editAssessment',
      'clearCache',
    ]);

    toastService = jasmine.createSpyObj('ToastNotificationService', [
      'showToast',
    ]);

    dialogRef = jasmine.createSpyObj('MatDialogRef', [
      'close',
      'backdropClick',
      'keydownEvents',
    ]);
    dialogRef.backdropClick.and.returnValue(EMPTY);
    dialogRef.keydownEvents.and.returnValue(EMPTY);

    unsavedChangesGuard = jasmine.createSpyObj('UnsavedChangesGuardService', [
      'attach',
      'requestClose',
    ]);
    unsavedChangesGuard.requestClose.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [EditAssessmentModalComponent, ReactiveFormsModule],
      providers: [
        {
          provide: AssessmentService,
          useValue: assessmentService,
        },
        {
          provide: ToastNotificationService,
          useValue: toastService,
        },
        {
          provide: MatDialogRef,
          useValue: dialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
          provide: UnsavedChangesGuardService,
          useValue: unsavedChangesGuard,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAssessmentModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form fields', () => {
    expect(component.formFields.length).toBe(7);
    expect(component.formFields[0].name).toBe('students');
    expect(component.formFields[4].name).toBe('service');
  });

  it('should not require professionalComment validator when assessment.comments is empty (branch false)', async () => {
    const noCommentData: AssessmentModalData = {
      ...dialogData,
      assessment: {
        ...assessment,
        comments: '',
      },
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [EditAssessmentModalComponent, ReactiveFormsModule],
      providers: [
        { provide: AssessmentService, useValue: assessmentService },
        { provide: ToastNotificationService, useValue: toastService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: noCommentData },
        { provide: UnsavedChangesGuardService, useValue: unsavedChangesGuard },
      ],
    }).compileComponents();

    const customFixture = TestBed.createComponent(EditAssessmentModalComponent);
    const customComponent = customFixture.componentInstance;

    const commentField = customComponent.formFields.find(
      f => f.name === 'professionalComment'
    );
    expect(commentField?.validators?.length).toBe(0);
  });

  describe('setFormGroup and valueChanges', () => {
    it('should set form group and detect when form has changes vs when it matches original', () => {
      const form = createForm();
      component['setFormGroup'](form);

      expect(component.form).toBe(form);
      expect(component['formHasChanges']()).toBeFalse();

      form.get('submitter')?.setValue('New Admin');
      expect(component['formHasChanges']()).toBeTrue();

      form.get('submitter')?.setValue('Admin');
      expect(component['formHasChanges']()).toBeFalse();
    });
  });

  describe('unsavedChangesGuard and requestClose', () => {
    it('should call requestClose on the guard', () => {
      component.requestClose();
      expect(unsavedChangesGuard.requestClose).toHaveBeenCalled();
    });

    it('should evaluate the formHasChanges callback passed to unsavedChangesGuard.attach', () => {
      const attachCall = unsavedChangesGuard.attach.calls.mostRecent();
      const hasChangesFn = attachCall.args[1];

      component['formHasChanges'].set(false);
      expect(hasChangesFn()).toBeFalse();

      component['formHasChanges'].set(true);
      expect(hasChangesFn()).toBeTrue();
    });
  });

  describe('submitAssessment', () => {
    it('should return early and not call service when form is invalid (branch false for form.valid)', () => {
      const form = createForm();
      form.get('service')?.setValue(null);
      component['setFormGroup'](form);

      component['submitAssessment']();

      expect(assessmentService.editAssessment).not.toHaveBeenCalled();
    });

    it('should edit assessment successfully and handle plain string options in extractOptionValue', () => {
      const form = createForm({
        service: 'Speech',
        professional: 'John',
        students: ['1'],
      });
      component['setFormGroup'](form);

      assessmentService.editAssessment.and.returnValue(
        of({
          ...assessment,
          studentIds: ['1'],
        })
      );

      component['submitAssessment']();

      expect(assessmentService.editAssessment).toHaveBeenCalledWith(
        '1',
        jasmine.objectContaining({
          service: 'Speech',
          assignedProfessional: 'John',
        })
      );
      expect(toastService.showToast).toHaveBeenCalled();
      expect(assessmentService.clearCache).toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should extract value correctly when service and professional are objects (branch true for extractOptionValue)', () => {
      const form = createForm({
        service: { value: 'Speech', label: 'speech' },
        professional: { value: 'John', label: 'john' },
        students: ['1'],
      });
      component['setFormGroup'](form);

      assessmentService.editAssessment.and.returnValue(
        of({
          ...assessment,
          studentIds: ['1'],
        })
      );

      component['submitAssessment']();

      expect(assessmentService.editAssessment).toHaveBeenCalledWith(
        '1',
        jasmine.objectContaining({
          service: 'Speech',
          assignedProfessional: 'John',
        })
      );
    });

    it('should display multi-student success message when totalStudents > 1 (branch true)', () => {
      const form = createForm({
        students: ['1', '2'],
      });
      component['setFormGroup'](form);

      assessmentService.editAssessment.and.returnValue(
        of({
          ...assessment,
          studentIds: ['1', '2'],
        })
      );

      component['submitAssessment']();

      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: jasmine.stringMatching(
            'and other 1 students has been updated'
          ),
        })
      );
    });

    it('should show error toast when edit fails with message from backend', () => {
      const form = createForm();
      component['setFormGroup'](form);

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid data' },
      });
      assessmentService.editAssessment.and.returnValue(
        throwError(() => errorResponse)
      );

      component['submitAssessment']();

      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Form Submission Failed',
          message: 'Bad Request: Invalid data',
        })
      );
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should show default error message when error.error.message is missing (branch fallback)', () => {
      const form = createForm();
      component['setFormGroup'](form);

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {},
      });
      assessmentService.editAssessment.and.returnValue(
        throwError(() => errorResponse)
      );

      component['submitAssessment']();

      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Form Submission Failed',
          message:
            'Internal Server Error: There was an error submitting the form. Please try again later.',
        })
      );
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe when valueChangesSubscription exists', () => {
      const subscription = jasmine.createSpyObj('Subscription', [
        'unsubscribe',
      ]);
      component['valueChangesSubscription'] = subscription;

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('should safely do nothing when valueChangesSubscription is undefined (branch false)', () => {
      component['valueChangesSubscription'] =
        undefined as unknown as (typeof component)['valueChangesSubscription'];

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
