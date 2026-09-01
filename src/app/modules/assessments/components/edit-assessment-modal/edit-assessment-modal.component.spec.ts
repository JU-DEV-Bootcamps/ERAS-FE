import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EMPTY, of, throwError } from 'rxjs';

import { EditAssessmentModalComponent } from './edit-assessment-modal.component';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { AssessmentService } from '@core/services/api/assessement.service';
import { AssessmentStatus } from '@core/models/assessment.model';

describe('EditAssessmentModalComponent', () => {
  let component: EditAssessmentModalComponent;
  let fixture: ComponentFixture<EditAssessmentModalComponent>;

  let assessmentService: jasmine.SpyObj<AssessmentService>;
  let toastService: jasmine.SpyObj<ToastNotificationService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EditAssessmentModalComponent>>;

  const assessment = {
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

  const dialogData = {
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

  it('should set form group and detect changes', () => {
    const form = new FormGroup({
      students: new FormControl([1]),
      date: new FormControl('2026-01-01'),
      submitter: new FormControl('Admin'),
      service: new FormControl(
        {
          value: 'Speech',
          label: 'speech',
        },
        Validators.required
      ),
      professional: new FormControl(
        {
          label: 'Professional',
          value: 'professional',
        },
        Validators.required
      ),
      professionalComment: new FormControl('comment'),
      status: new FormControl(AssessmentStatus.Remitted),
    });
    component['setFormGroup'](form);

    expect(component.form).toBe(form);
  });

  it('should edit assessment successfully', () => {
    const form = new FormGroup({
      date: new FormControl('2026-01-01'),
      submitter: new FormControl('Admin'),
      service: new FormControl(
        {
          value: 'Speech',
          label: 'speech',
        },
        Validators.required
      ),
      professional: new FormControl(
        {
          label: 'Professional',
          value: 'professional',
        },
        Validators.required
      ),
      students: new FormControl([1]),
      professionalComment: new FormControl('comment'),
      status: new FormControl(AssessmentStatus.Remitted),
    });
    component['setFormGroup'](form);
    assessmentService.editAssessment.and.returnValue(
      of({
        ...assessment,
        studentIds: ['1'],
      })
    );
    component['submitAssessment']();

    expect(assessmentService.editAssessment).toHaveBeenCalled();
    expect(toastService.showToast).toHaveBeenCalled();
    expect(assessmentService.clearCache).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should show error toast when edit fails', () => {
    const form = new FormGroup({
      date: new FormControl('2026-01-01'),
      submitter: new FormControl('Admin'),
      service: new FormControl(
        {
          value: 'Speech',
          label: 'speech',
        },
        Validators.required
      ),
      professional: new FormControl(
        {
          value: 'John',
          label: 'john',
        },
        Validators.required
      ),
      students: new FormControl([1]),
      professionalComment: new FormControl('comment'),
      status: new FormControl(AssessmentStatus.Remitted),
    });
    component['setFormGroup'](form);
    assessmentService.editAssessment.and.returnValue(
      throwError(() => ({
        statusText: 'Bad Request',
        error: {
          message: 'Invalid data',
        },
      }))
    );
    component['submitAssessment']();
    expect(toastService.showToast).toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const subscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['valueChangesSubscription'] = subscription;
    component.ngOnDestroy();
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });
});
