import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError, EMPTY } from 'rxjs';

import {
  InterventionModel,
  InterventionType,
} from '@core/models/assessment.model';
import { DynamicField } from '@core/factories/forms/form-factory.interface';
import { InterventionService } from '@core/services/api/intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import {
  NewInterventionDialogData,
  NewInterventionModalComponent,
} from './new-intervention-modal.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StagedFile } from '@core/models/attachment.model';

describe('NewInterventionModalComponent', () => {
  let component: NewInterventionModalComponent;
  let fixture: ComponentFixture<NewInterventionModalComponent>;
  let mockInterventionService: jasmine.SpyObj<InterventionService>;
  let mockToastService: jasmine.SpyObj<ToastNotificationService>;
  let mockDialogRef: jasmine.SpyObj<
    MatDialogRef<NewInterventionModalComponent>
  >;
  let mockUnsavedChangesGuard: jasmine.SpyObj<UnsavedChangesGuardService>;

  const mockData: NewInterventionDialogData = {
    assessmentId: 1,
    professional: { label: 'Dr. Smith', value: '10' },
    students: [
      { label: 'Student A', value: 1 },
      { label: 'Student B', value: 2 },
    ],
  };

  const buildValidFormGroup = (overrides: Record<string, unknown> = {}) =>
    new FormGroup({
      date: new FormControl(
        overrides['date'] ?? new Date().toISOString(),
        Validators.required
      ),
      type: new FormControl(
        overrides['type'] ?? InterventionType.Individual,
        Validators.required
      ),
      activity: new FormControl(
        overrides['activity'] ?? 'Activity',
        Validators.required
      ),
      area: new FormControl(overrides['area'] ?? 'Area', Validators.required),
      mode: new FormControl(overrides['mode'] ?? 'Mode', Validators.required),
      students: new FormControl(
        overrides['students'] ?? [1],
        Validators.required
      ),
      riskLevelName: new FormControl(
        overrides['riskLevelName'] ?? 'Low',
        Validators.required
      ),
      professionalId: new FormControl(
        overrides['professionalId'] ?? 10,
        Validators.required
      ),
      uploadInput: new FormControl(overrides['uploadInput'] ?? []),
      comments: new FormControl(overrides['comments'] ?? 'Some comments here', [
        Validators.required,
        Validators.minLength(10),
      ]),
    });

  async function createComponentWithData(data: NewInterventionDialogData) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NewInterventionModalComponent],
      providers: [
        { provide: InterventionService, useValue: mockInterventionService },
        { provide: ToastNotificationService, useValue: mockToastService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        {
          provide: UnsavedChangesGuardService,
          useValue: mockUnsavedChangesGuard,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(NewInterventionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    mockInterventionService = jasmine.createSpyObj('InterventionService', [
      'createIntervention',
      'uploadAttachments',
    ]);
    mockToastService = jasmine.createSpyObj('ToastNotificationService', [
      'showToast',
    ]);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', [
      'close',
      'backdropClick',
      'keydownEvents',
    ]);
    mockDialogRef.backdropClick.and.returnValue(EMPTY);
    mockDialogRef.keydownEvents.and.returnValue(EMPTY);

    mockUnsavedChangesGuard = jasmine.createSpyObj(
      'UnsavedChangesGuardService',
      ['attach', 'requestClose']
    );
    mockUnsavedChangesGuard.requestClose.and.returnValue(of(true));

    await createComponentWithData(mockData);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isGroup to true on init when more than one student', () => {
    expect(component.isGroup()).toBeTrue();
  });

  it('should set isGroup to false on init when only one student', async () => {
    const oneStudentData: NewInterventionDialogData = {
      ...mockData,
      students: [{ label: 'Student A', value: 1 }],
    };
    await createComponentWithData(oneStudentData);
    expect(component.isGroup()).toBeFalse();
  });

  it('should build form fields including students field on init', () => {
    component.ngOnInit();
    const names = component.formFields.map((f: DynamicField) => f.name);
    expect(names).toContain('students');
    expect(names).toContain('date');
    expect(names).toContain('type');
  });

  it('should disable the type field when there is only one student', async () => {
    const oneStudentData: NewInterventionDialogData = {
      ...mockData,
      students: [{ label: 'Student A', value: 1 }],
    };
    await createComponentWithData(oneStudentData);
    component.ngOnInit();
    const typeField = component.formFields.find(
      (f: DynamicField) => f.name === 'type'
    );
    expect(typeField?.disabled).toBeTrue();
    expect(typeField?.value).toBe(InterventionType.Individual);
  });

  it('should use the single-select student field when there is only one student', async () => {
    const oneStudentData: NewInterventionDialogData = {
      ...mockData,
      students: [{ label: 'Student A', value: 1 }],
    };
    await createComponentWithData(oneStudentData);
    component.ngOnInit();
    const studentsField = component.formFields.find(
      (f: DynamicField) => f.name === 'students'
    );
    expect(studentsField?.type).toBe('select');
    expect(studentsField?.multipleSelect).toBeUndefined();
  });

  it('should compute numberOfParticipants from data.students length', () => {
    expect(component.numberOfParticipants()).toBe(2);
  });

  describe('isSubmitDisabled', () => {
    it('should return true when form is not set', () => {
      component.form = undefined as unknown as FormGroup;
      expect(component.isSubmitDisabled).toBeTrue();
    });

    it('should return true when form is invalid', () => {
      component.form = buildValidFormGroup();
      component.form.get('comments')?.setValue('');
      component.form.markAsDirty();
      expect(component.isSubmitDisabled).toBeTrue();
    });

    it('should return true when form is pristine', () => {
      component.form = buildValidFormGroup();
      component.form.markAsPristine();
      expect(component.isSubmitDisabled).toBeTrue();
    });

    it('should return true when isSubmitting is true', () => {
      component.form = buildValidFormGroup();
      component.form.markAsDirty();
      component.isSubmitting = true;
      expect(component.isSubmitDisabled).toBeTrue();
    });

    it('should return false when form is valid, dirty, and not submitting', () => {
      component.form = buildValidFormGroup();
      component.form.markAsDirty();
      component.isSubmitting = false;
      expect(component.isSubmitDisabled).toBeFalse();
    });
  });

  describe('selectedStudentCount', () => {
    it('should return 0 when form is not set', () => {
      component.form = undefined as unknown as FormGroup;
      expect(component.selectedStudentCount()).toBe(0);
    });

    it('should return 0 when the students control is missing', () => {
      component.form = new FormGroup({});
      expect(component.selectedStudentCount()).toBe(0);
    });

    it('should return the selected students length from the form when group', () => {
      component.isGroup.set(true);
      component.form = new FormGroup({
        students: new FormControl([1, 2]),
      });
      expect(component.selectedStudentCount()).toBe(2);
    });

    it('should return 0 when group value is not an array', () => {
      component.isGroup.set(true);
      component.form = new FormGroup({
        students: new FormControl(null),
      });
      expect(component.selectedStudentCount()).toBe(0);
    });

    it('should return 1 when individual and value is present', () => {
      component.isGroup.set(false);
      component.form = new FormGroup({
        students: new FormControl(1),
      });
      expect(component.selectedStudentCount()).toBe(1);
    });

    it('should return 0 when individual and value is null or falsy', () => {
      component.isGroup.set(false);
      component.form = new FormGroup({
        students: new FormControl(null),
      });
      expect(component.selectedStudentCount()).toBe(0);
    });
  });

  describe('unsavedChangesGuard callbacks and requestClose', () => {
    it('should invoke requestClose on the guard', () => {
      component.requestClose();
      expect(mockUnsavedChangesGuard.requestClose).toHaveBeenCalled();
    });

    it('should test dirty check callback attached to guard', () => {
      const attachCall = mockUnsavedChangesGuard.attach.calls.mostRecent();
      const dirtyFn = attachCall.args[1];

      component.form = undefined as unknown as FormGroup;
      expect(dirtyFn()).toBeFalse();

      component.form = buildValidFormGroup();
      component.form.markAsPristine();
      expect(dirtyFn()).toBeFalse();

      component.form.markAsDirty();
      expect(dirtyFn()).toBeTrue();
    });
  });

  describe('closeAndResetDialog & attachments', () => {
    it('should close dialog without result on closeAndResetDialog', () => {
      component.closeAndResetDialog();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('setFormGroup', () => {
    it('should normalize non-array students control to array when isGroup is true', () => {
      component.isGroup.set(true);
      const form = new FormGroup({
        students: new FormControl<number | number[] | null>(1),
      });

      component.setFormGroup(form);

      const value: unknown = form.get('students')?.value;
      expect(value).toEqual([1]);
    });

    it('should normalize null students control to empty array when isGroup is true', () => {
      component.isGroup.set(true);
      const form = new FormGroup({
        students: new FormControl<number | number[] | null>(null),
      });

      component.setFormGroup(form);

      const value: unknown = form.get('students')?.value;
      expect(value).toEqual([]);
    });

    it('should normalize null students control to empty array when isGroup is true', () => {
      component.isGroup.set(true);
      const form = new FormGroup({
        students: new FormControl<number | number[] | null>(null),
      });

      component.setFormGroup(form);

      expect(form.get('students')?.value as unknown).toEqual([]);
    });

    it('should toggle isGroup and rebuild fields when type changes to Individual', fakeAsync(() => {
      component.ngOnInit();
      const form = new FormGroup({
        type: new FormControl(InterventionType.Group),
        students: new FormControl([1, 2]),
      });
      component['formSettling'] = false;
      component.setFormGroup(form);

      form.get('type')?.setValue(InterventionType.Individual);
      tick();
      fixture.detectChanges();

      expect(component.isGroup()).toBeFalse();
      const studentsField = component.formFields.find(
        (f: DynamicField) => f.name === 'students'
      );
      expect(studentsField?.type).toBe('select');
    }));

    it('should toggle isGroup and rebuild fields when type changes to Group', fakeAsync(() => {
      component.data = {
        ...mockData,
        students: [{ label: 'Student A', value: 1 }],
      };
      component.isGroup.set(false);
      component.ngOnInit();

      const form = new FormGroup({
        type: new FormControl(InterventionType.Individual),
        students: new FormControl(1),
      });

      component['formSettling'] = false;
      component.setFormGroup(form);

      form.get('type')?.setValue(InterventionType.Group);

      tick();
      fixture.detectChanges();

      expect(component.isGroup()).toBeTrue();
      const studentsField = component.formFields.find(
        (f: DynamicField) => f.name === 'students'
      );
      expect(studentsField?.type).toBe('searchableSelect');
    }));

    it('should return early in handleTypeSwitch if target type is already active', () => {
      component.isGroup.set(true);
      component['handleTypeSwitch'](InterventionType.Group);
      expect(component.isGroup()).toBeTrue();
    });

    it('should use single non-array student value when switching from group to individual', fakeAsync(() => {
      component.isGroup.set(true);
      const form = new FormGroup({
        type: new FormControl(InterventionType.Group),
        students: new FormControl(2),
      });
      component['formSettling'] = false;
      component.setFormGroup(form);

      form.get('type')?.setValue(InterventionType.Individual);
      tick();
      fixture.detectChanges();

      expect(component.isGroup()).toBeFalse();
    }));

    it('should fallback to first roster student when switching to individual with null students value', fakeAsync(() => {
      component.isGroup.set(true);
      const form = new FormGroup({
        type: new FormControl(InterventionType.Group),
        students: new FormControl(null),
      });
      component['formSettling'] = false;
      component.setFormGroup(form);

      form.get('type')?.setValue(InterventionType.Individual);
      tick();
      fixture.detectChanges();

      expect(component.isGroup()).toBeFalse();
    }));

    describe('students value changes', () => {
      it('should ignore student valueChanges when formSettling or isSwitchingType is true', () => {
        component.isGroup.set(true);
        const form = new FormGroup({
          students: new FormControl([1, 2]),
        });
        component['formSettling'] = true;
        component.setFormGroup(form);

        form.get('students')?.setValue([1]);
        expect(component.isGroup()).toBeTrue();
      });

      it('should ignore student valueChanges when not group', () => {
        component.isGroup.set(false);
        const form = new FormGroup({
          students: new FormControl(1),
        });
        component['formSettling'] = false;
        component.setFormGroup(form);

        form.get('students')?.setValue(2);
        expect(component.isGroup()).toBeFalse();
      });

      it('should handle non-array student value when valueChanges triggers', fakeAsync(() => {
        component.isGroup.set(true);
        const form = new FormGroup({
          type: new FormControl(InterventionType.Group),
          students: new FormControl<number | number[] | null>([1, 2]),
        });
        component['formSettling'] = false;
        component.setFormGroup(form);

        form.get('students')?.setValue(1);
        tick();
        fixture.detectChanges();

        expect(component.isGroup()).toBeFalse();
      }));

      it('should handle null student value when valueChanges triggers', fakeAsync(() => {
        component.isGroup.set(true);
        const form = new FormGroup({
          type: new FormControl(InterventionType.Group),
          students: new FormControl([1, 2]),
        });
        component['formSettling'] = false;
        component.setFormGroup(form);

        form.get('students')?.setValue(null);
        tick();
        fixture.detectChanges();

        expect(component.isGroup()).toBeFalse();
      }));

      it('should not switch type if selected students count is 2 or more', () => {
        component.isGroup.set(true);
        const form = new FormGroup({
          type: new FormControl(InterventionType.Group),
          students: new FormControl([1, 2]),
        });
        component['formSettling'] = false;
        component.setFormGroup(form);

        form.get('students')?.setValue([1, 2]);
        expect(component.isGroup()).toBeTrue();
      });
    });
  });

  describe('submitIntervention', () => {
    it('should return early when form is invalid', () => {
      component.form = buildValidFormGroup();
      component.form.get('comments')?.setValue('');

      component.submitIntervention();

      expect(mockInterventionService.createIntervention).not.toHaveBeenCalled();
    });

    it('should use kindIntervention fallback when form.value.type is null', () => {
      component.isGroup.set(false);
      component.form = buildValidFormGroup({
        type: null,
        students: '1',
      });
      component.formFields = [
        {
          name: 'type',
          type: 'select',
          label: 'Type',
          value: InterventionType.Individual,
        },
      ];

      const created: InterventionModel = { id: 5 } as InterventionModel;
      mockInterventionService.createIntervention.and.returnValue(of(created));

      component.submitIntervention();

      expect(mockInterventionService.createIntervention).toHaveBeenCalledWith(
        jasmine.objectContaining({
          intervention: jasmine.objectContaining({
            kind: InterventionType.Individual,
          }),
        })
      );
    });

    it('should handle submission error with error title from backend', () => {
      component.form = buildValidFormGroup({
        type: InterventionType.Individual,
        students: [1],
      });

      const httpError = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { title: 'Validation Failed' },
      });
      mockInterventionService.createIntervention.and.returnValue(
        throwError(() => httpError)
      );

      component.submitIntervention();

      expect(mockToastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Form Submission Failed',
          message: 'Bad Request: Validation Failed',
          type: 'error',
        }),
        true
      );
      expect(component.isSubmitting).toBeFalse();
    });

    it('should handle submission error without error title from backend (fallback message)', () => {
      component.form = buildValidFormGroup({
        type: InterventionType.Individual,
        students: [1],
      });

      const httpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: null,
      });
      mockInterventionService.createIntervention.and.returnValue(
        throwError(() => httpError)
      );

      component.submitIntervention();

      expect(mockToastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Form Submission Failed',
          message:
            'Internal Server Error: There was an error submitting the form. Please try again later.',
          type: 'error',
        }),
        true
      );
      expect(component.isSubmitting).toBeFalse();
    });
  });

  describe('onStagedFilesChange', () => {
    it('should set the appropriate upload errors and mark the control dirty', () => {
      const control = component.form.get('uploadInput')!;

      component.onStagedFilesChange([
        {
          status: 'uploading',
          file: {},
          attachmentId: 1,
          localId: '1',
        } as StagedFile,
      ]);

      expect(control.errors).toEqual({ uploading: true });
      expect(control.dirty).toBeTrue();

      component.onStagedFilesChange([
        {
          status: 'error',
          file: {},
          attachmentId: 1,
          localId: '1',
        } as StagedFile,
      ]);

      expect(control.errors).toEqual({ uploadError: true });

      component.onStagedFilesChange([
        {
          status: 'completed',
          file: {},
          attachmentId: 1,
          localId: '1',
        } as unknown as StagedFile,
      ]);

      expect(control.errors).toBeNull();
    });

    it('should return without doing anything when uploadInput control does not exist', () => {
      component.form.removeControl('uploadInput');
      expect(() =>
        component.onStagedFilesChange([
          {
            status: 'uploading',
            file: {},
            attachmentId: 1,
            localId: '1',
          } as StagedFile,
        ])
      ).not.toThrow();
    });
  });
});
