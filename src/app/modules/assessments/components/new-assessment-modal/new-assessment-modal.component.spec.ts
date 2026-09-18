import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { of, throwError, EMPTY } from 'rxjs';

import { NewAssessmentModalComponent } from './new-assessment-modal.component';
import { AssessmentService } from '@core/services/api/assessement.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import {
  AssessmentStatus,
  AssessmentModel,
} from '@core/models/assessment.model';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { AssessmentsLookups } from '@modules/assessments/models/assessments.interfaces';

describe('NewAssessmentModalComponent', () => {
  let component: NewAssessmentModalComponent;
  let fixture: ComponentFixture<NewAssessmentModalComponent>;
  let assessmentService: jasmine.SpyObj<AssessmentService>;
  let toastService: jasmine.SpyObj<ToastNotificationService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<NewAssessmentModalComponent>>;
  let unsavedChangesGuard: jasmine.SpyObj<UnsavedChangesGuardService>;

  const data: AssessmentsLookups = {
    students: [
      { label: 'John', value: 1 },
      { label: 'Jane', value: 2 },
    ],
    profiles: [{ label: 'Teacher', value: 'teacher' }],
    services: [{ label: 'Speech', value: 'speech' }],
    professionals: [{ label: 'Professional', value: 'professional' }],
    preselectedStudentId: 1,
    createService: jasmine.createSpy(),
    createProfessional: jasmine.createSpy(),
  };

  beforeEach(async () => {
    assessmentService = jasmine.createSpyObj('AssessmentService', [
      'createAssessment',
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
      imports: [ReactiveFormsModule, NewAssessmentModalComponent],
      providers: [
        { provide: AssessmentService, useValue: assessmentService },
        { provide: ToastNotificationService, useValue: toastService },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data,
        },
        {
          provide: MatDialogRef,
          useValue: dialogRef,
        },
        {
          provide: UnsavedChangesGuardService,
          useValue: unsavedChangesGuard,
        },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewAssessmentModalComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    component.form = new FormGroup({
      students: new FormControl([1]),
      date: new FormControl('2024-01-01', Validators.required),
      submitter: new FormControl('teacher'),
      service: new FormControl('speech'),
      professional: new FormControl('professional', Validators.required),
      professionalComment: new FormControl('Comment'),
    });
  });

  describe('constructor and initial setup', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form fields', () => {
      expect(component.formFields.length).toBe(6);

      expect(component.formFields[0].name).toBe('students');
      expect(component.formFields[1].name).toBe('date');
      expect(component.formFields[2].name).toBe('submitter');
      expect(component.formFields[3].name).toBe('service');
      expect(component.formFields[4].name).toBe('professional');
      expect(component.formFields[5].name).toBe('professionalComment');
    });

    it('should preselect student', () => {
      expect(component.formFields[0].value).toEqual([1]);
    });

    it('should set default submitter', () => {
      expect(component.formFields[2].value).toBe('teacher');
    });
  });

  describe('constructor fallback branches', () => {
    it('should use empty array for students when preselectedStudentId is not provided and null for submitter when profiles are empty', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, NewAssessmentModalComponent],
        providers: [
          { provide: AssessmentService, useValue: assessmentService },
          { provide: ToastNotificationService, useValue: toastService },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              ...data,
              preselectedStudentId: undefined,
              profiles: [],
            } as unknown as AssessmentsLookups,
          },
          { provide: MatDialogRef, useValue: dialogRef },
          {
            provide: UnsavedChangesGuardService,
            useValue: unsavedChangesGuard,
          },
          provideHttpClient(),
        ],
      }).compileComponents();

      const customFixture = TestBed.createComponent(
        NewAssessmentModalComponent
      );
      const customComponent = customFixture.componentInstance;

      expect(customComponent.formFields[0].value).toEqual([]);
      expect(customComponent.formFields[2].value).toBeNull();
    });
  });

  describe('closeAndResetDialog', () => {
    it('should close dialog', () => {
      component.closeAndResetDialog();

      expect(dialogRef.close).toHaveBeenCalled();
    });
  });

  describe('unsavedChangesGuard and requestClose', () => {
    it('should call requestClose on guard', () => {
      component.requestClose();
      expect(unsavedChangesGuard.requestClose).toHaveBeenCalled();
    });

    it('should evaluate the dirty callback passed to attach', () => {
      const attachCall = unsavedChangesGuard.attach.calls.mostRecent();
      const dirtyFn = attachCall.args[1];

      component.form = undefined as unknown as FormGroup;
      expect(dirtyFn()).toBeFalse();

      component.form = new FormGroup({});
      component.form.markAsPristine();
      expect(dirtyFn()).toBeFalse();

      component.form.markAsDirty();
      expect(dirtyFn()).toBeTrue();
    });
  });

  describe('setFormGroup', () => {
    it('should set form', () => {
      const form = new FormGroup({
        test: new FormControl('abc'),
      });

      component.setFormGroup(form);

      expect(component.form).toBe(form);
    });
  });

  describe('submitAssessment', () => {
    it('should not submit when form is invalid (branch false)', () => {
      const invalidForm = new FormGroup({
        date: new FormControl(null, Validators.required),
      });
      component.form = invalidForm;

      component.submitAssessment();

      expect(assessmentService.createAssessment).not.toHaveBeenCalled();
    });

    it('should not submit while already submitting', () => {
      component.isSubmitting = true;

      component.submitAssessment();

      expect(assessmentService.createAssessment).not.toHaveBeenCalled();
    });

    it('should extract value from object options correctly (extractOptionValue object branch)', () => {
      component.form = new FormGroup({
        students: new FormControl(['1']),
        date: new FormControl('2024-01-01', Validators.required),
        submitter: new FormControl('teacher'),
        service: new FormControl({
          value: 'speech_therapy',
          label: 'Speech Therapy',
        }),
        professional: new FormControl({
          value: 'prof1',
          label: 'Professional 1',
        }),
        professionalComment: new FormControl('Comment'),
      });

      assessmentService.createAssessment.and.returnValue(
        of({ studentIds: ['1'] } as unknown as AssessmentModel)
      );

      component.submitAssessment();

      const request =
        assessmentService.createAssessment.calls.mostRecent().args[0];
      expect(request.service).toBe('speech_therapy');
      expect(request.assignedProfessional).toBe('prof1');
    });

    it('should create assessment successfully with string options', () => {
      const response: AssessmentModel = {
        id: 10,
        createdAtUtc: '2024-01-01',
        createdBy: '',
        service: 'speech',
        assignedProfessional: 'teacher',
        studentIds: ['1'],
        comments: '',
        status: AssessmentStatus.Remitted,
        interventions: [],
      };
      assessmentService.createAssessment.and.returnValue(of(response));
      component.submitAssessment();

      expect(assessmentService.createAssessment).toHaveBeenCalled();

      const request =
        assessmentService.createAssessment.calls.mostRecent().args[0];

      expect(request.createdBy).toBe('teacher');
      expect(request.service).toBe('speech');
      expect(request.assignedProfessional).toBe('professional');
      expect(request.comments).toBe('Comment');
      expect(request.status).toBe(AssessmentStatus.Remitted);

      expect(toastService.showToast).toHaveBeenCalled();
      expect(assessmentService.clearCache).toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should handle createAssessment error and use error title when available', () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          title: 'Validation failed',
        },
      });

      assessmentService.createAssessment.and.returnValue(
        throwError(() => error)
      );
      spyOn(console, 'error');

      component.submitAssessment();

      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Form Submission Failed',
          message: 'Bad Request: Validation failed',
          type: 'error',
        }),
        true
      );

      expect(component.isSubmitting).toBeFalse();
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('success toast', () => {
    it('should build message for one student', () => {
      const toast = component['buildSuccessToastDataObject']({
        studentIds: ['1'],
        createdAtUtc: '01/01/2026',
        createdBy: 'constructor',
        service: 'new',
        status: AssessmentStatus.Finalized,
        interventions: [],
      } as unknown as AssessmentModel);
      expect(toast.message).not.toContain('other');
    });

    it('should build message for multiple students', () => {
      const toast = component['buildSuccessToastDataObject']({
        studentIds: ['1', '2'],
        createdAtUtc: '01/01/2026',
        createdBy: 'constructor',
        service: 'new',
        status: AssessmentStatus.Finalized,
        interventions: [],
      } as unknown as AssessmentModel);
      expect(toast.message).toContain('and other 1 students');
    });
  });

  describe('error toast', () => {
    it('should use default error message when error title is missing (branch fallback)', () => {
      const toast = component['buildErrorToastDataObject'](
        new HttpErrorResponse({
          statusText: 'Bad Request',
          error: {},
        })
      );
      expect(toast.message).toContain('There was an error submitting the form');
    });
  });
});
