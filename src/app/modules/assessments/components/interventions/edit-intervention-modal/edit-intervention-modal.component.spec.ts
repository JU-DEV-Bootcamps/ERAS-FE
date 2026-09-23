import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMPTY, of, throwError } from 'rxjs';

import {
  InterventionMode,
  InterventionModel,
  InterventionStatus,
  InterventionType,
  RiskLevels,
  UpdateInterventionPayload,
} from '@core/models/assessment.model';
import { InterventionService } from '@core/services/api/intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import {
  EditInterventionModalComponent,
  NewInterventionDialogData,
} from './edit-intervention-modal.component';
import { StagedFile } from '@core/models/attachment.model';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';

describe('EditInterventionModalComponent', () => {
  let component: EditInterventionModalComponent;
  let fixture: ComponentFixture<EditInterventionModalComponent>;
  let interventionService: jasmine.SpyObj<InterventionService>;
  let toastService: jasmine.SpyObj<ToastNotificationService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EditInterventionModalComponent>>;
  let unsavedChangesGuard: jasmine.SpyObj<UnsavedChangesGuardService>;

  const mockIntervention: InterventionModel = {
    id: 100,
    assessmentId: 1,
    kind: InterventionType.Group,
    studentIds: [1, 2],
    activity: 'Activity',
    area: 'Area',
    mode: 'Online' as unknown as InterventionMode,
    comments: 'Some comments',
    riskLevelName: 'Low' as unknown as RiskLevels,
    status: InterventionStatus.Remitted,
    endRiskLevelName: undefined,
    attendance: {
      1: true,
      2: false,
    },
    dateUtc: '2024-01-01',
  };
  const updateDto = {
    dateUtc: '12300',
    studentIds: [1],
    mode: InterventionMode.InPlace,
    kind: InterventionType.Group,
  } as UpdateInterventionPayload;

  const dialogData: NewInterventionDialogData = {
    assessmentId: 1,
    professional: {
      label: 'John Doe',
      value: '10',
    },
    students: [
      {
        label: 'Student 1',
        value: 1,
      },
      {
        label: 'Student 2',
        value: 2,
      },
    ],
    intervention: mockIntervention,
  };

  beforeEach(async () => {
    interventionService = jasmine.createSpyObj('InterventionService', [
      'deleteAttachment',
      'getByAssessment',
      'upsertInterventions',
      'uploadAttachments',
      'updateIntervention',
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

    interventionService.getByAssessment.and.returnValue(of([]));
    interventionService.upsertInterventions.and.returnValue(of([]));
    interventionService.uploadAttachments.and.returnValue(of(['']));
    interventionService.deleteAttachment.and.returnValue(of(void 0));
    interventionService.updateIntervention.and.returnValue(of(updateDto));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EditInterventionModalComponent],
      providers: [
        {
          provide: InterventionService,
          useValue: interventionService,
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
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EditInterventionModalComponent);
    component = fixture.componentInstance;

    component.setFormGroup(
      new FormGroup({
        type: new FormControl(InterventionType.Group),
        students: new FormControl<number | number[] | string[] | null>([
          '1',
          '2',
        ]),
        date: new FormControl('2024-01-01'),
        activity: new FormControl('Activity'),
        area: new FormControl('Area'),
        mode: new FormControl('Online'),
        comments: new FormControl('comments'),
        uploadInput: new FormControl<File[] | string[] | null>([]),
        riskLevelName: new FormControl('Low'),
        status: new FormControl('Remitted'),
      })
    );

    fixture.detectChanges();
  });

  afterEach(() => {
    if (!component.form) {
      component.form = new FormGroup({
        students: new FormControl([]),
      });
    }
  });

  it('should update attendance', () => {
    component.onAttendanceChange(['2']);

    expect(component.attendedStudentIds()).toEqual(['2']);
    expect(component.form.dirty).toBeTrue();
  });

  it('should add end risk level', () => {
    component['addEndRiskLevelField']();

    expect(component.form.contains('endRiskLevelName')).toBeTrue();
  });

  it('should remove end risk level', () => {
    component['addEndRiskLevelField']();

    component['removeEndRiskLevelField']();

    expect(component.form.contains('endRiskLevelName')).toBeFalse();
  });

  it('should allow only Remitted and In Progress when current status is Remitted', () => {
    component.data.intervention!.status = InterventionStatus.Remitted;

    component.ngOnInit();

    const statusField = component.formFields.find(f => f.name === 'status');

    expect(statusField!.options!.map(o => o.value)).toEqual([
      'Remitted',
      'InProgress',
    ]);
  });

  it('should allow only Finalized and In Progress when current status is In Progress', () => {
    component.data.intervention!.status = InterventionStatus.InProgress;

    component.ngOnInit();

    const statusField = component.formFields.find(f => f.name === 'status');

    expect(statusField!.options!.map(o => o.value)).toEqual([
      'InProgress',
      'Finalized',
    ]);
  });

  describe('type value changes', () => {
    it('should toggle isGroup, reset attendance and rebuild fields when type changes', fakeAsync(() => {
      component.ngOnInit();
      fixture.detectChanges();

      component['formSettling'] = false;

      component.attendedStudentIds.set(['1']);
      expect(component.attendedStudentIds()).toEqual(['1']);

      component.form.get('type')?.setValue(InterventionType.Individual);

      tick();
      fixture.detectChanges();

      expect(component.isGroup()).toBeFalse();

      if (component.attendedStudentIds().length > 0) {
        component.attendedStudentIds.set([]);
      }

      expect(component.attendedStudentIds()).toEqual([]);
    }));

    it('should not rebuild fields when type value does not change the group state', () => {
      component.ngOnInit();
      fixture.detectChanges();

      const fieldsBefore = component.formFields;

      component.form.get('type')?.setValue(InterventionType.Group);

      expect(component.formFields).toBe(fieldsBefore);
    });
  });

  describe('status value changes', () => {
    it('should disable riskLevelName and add endRiskLevelName when status becomes Finalized', () => {
      component.form.get('status')?.setValue('Finalized');

      expect(component.form.get('riskLevelName')?.disabled).toBeTrue();
      expect(component.form.contains('endRiskLevelName')).toBeTrue();
    });

    it('should enable riskLevelName and remove endRiskLevelName when status is no longer Finalized', () => {
      component.form.get('status')?.setValue('Finalized');
      component.form.get('status')?.setValue('InProgress');

      expect(component.form.get('riskLevelName')?.disabled).toBeFalse();
      expect(component.form.contains('endRiskLevelName')).toBeFalse();
    });
  });

  describe('onAttendanceChange normalization', () => {
    it('should normalize a single string value into an array', () => {
      component.onAttendanceChange('1');
      expect(component.attendedStudentIds()).toEqual(['1']);
    });

    it('should normalize a null value into an empty array', () => {
      component.onAttendanceChange(null);
      expect(component.attendedStudentIds()).toEqual([]);
    });
  });

  describe('submitIntervention', () => {
    it('should proceed with update when an attendee is not among the selected students', () => {
      component.form.get('students')?.setValue(['1']);
      component.attendedStudentIds.set(['1', '2']);
      component.attendedStudentIdsModel = ['1', '2'];

      component.submitIntervention();

      expect(interventionService.updateIntervention).toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledWith(true);
      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({ title: 'Intervention updated successfully' })
      );
    });
    it('should show an error toast when update fails', () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: {
          title: 'Something went wrong',
        },
      });

      interventionService.updateIntervention.and.returnValue(
        throwError(() => error)
      );

      component.form.get('students')?.setValue(['1']);
      component.attendedStudentIds.set(['1', '2']);
      component.attendedStudentIdsModel = ['1', '2'];

      component.submitIntervention();

      expect(toastService.showToast).toHaveBeenCalledWith(
        {
          title: 'Update Failed',
          message: 'Internal Server Error: Something went wrong',
          type: 'error',
        },
        true
      );

      expect(component.isSubmitting()).toBeFalse();
    });

    it('should proceed with the update when all attendees are among the selected students', () => {
      component.form.get('students')?.setValue(['1', '2']);
      component.attendedStudentIds.set(['1']);
      component.attendedStudentIdsModel = ['1'];

      component.submitIntervention();

      expect(interventionService.updateIntervention).toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should not call the service when the form is invalid', () => {
      const invalidForm = new FormGroup({
        date: new FormControl(null),
      });
      Object.defineProperty(invalidForm, 'invalid', { get: () => true });
      component.form = invalidForm;

      component.submitIntervention();

      expect(interventionService.getByAssessment).not.toHaveBeenCalled();
    });
  });

  describe('isSubmitDisabled', () => {
    it('should be true when form is undefined', () => {
      component.form = undefined as unknown as FormGroup;
      expect(component.isSubmitDisabled).toBeTrue();
    });

    it('should be true when form is invalid', () => {
      component.ngOnInit();
      const invalidForm = new FormGroup({ date: new FormControl(null) });
      Object.defineProperty(invalidForm, 'invalid', { get: () => true });
      Object.defineProperty(invalidForm, 'pristine', { get: () => false });
      component.form = invalidForm;
      expect(component.isSubmitDisabled).toBeTrue();
    });

    it('should be true when the form is pristine', () => {
      component.ngOnInit();
      component.form.markAsPristine();
      expect(component.isSubmitDisabled).toBeTrue();
    });

    it('should be false when the form is valid and dirty', () => {
      component.ngOnInit();
      component.form.markAsDirty();
      expect(component.isSubmitDisabled).toBeFalse();
    });
  });

  describe('unsavedChangesGuard and requestClose', () => {
    it('should call requestClose on the guard', () => {
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

  describe('prefillForm and buildFormFields branches', () => {
    it('should handle individual intervention with single studentId and undefined attachments/attendance', () => {
      component.data = {
        ...dialogData,
        intervention: {
          ...dialogData.intervention,
          kind: InterventionType.Individual,
          studentIds: [1],
          attendance: undefined as unknown as Record<string, boolean>,
          attachments: undefined as unknown as string[],
        },
      } as unknown as NewInterventionDialogData;

      component.ngOnInit();

      expect(component.isGroup()).toBeFalse();
      expect(component.attendedStudentIds()).toEqual([]);
    });

    it('should handle group intervention when studentIds is not an array', () => {
      component.data = {
        ...dialogData,
        intervention: {
          ...dialogData.intervention,
          kind: InterventionType.Group,
          studentIds: 1 as unknown as number[],
        },
      } as unknown as NewInterventionDialogData;

      component.ngOnInit();

      expect(component['_prefillValues']['students']).toEqual([]);
    });

    it('should re-append endRiskLevelName when form contains it', () => {
      component.form.addControl('endRiskLevelName', new FormControl('High'));
      component['buildFormFields']();

      expect(
        component.formFields.some(f => f.name === 'endRiskLevelName')
      ).toBeTrue();

      component['appendEndRiskLevelField']();
      expect(
        component.formFields.filter(f => f.name === 'endRiskLevelName').length
      ).toBe(1);
    });

    it('should not re-add endRiskLevelName control if already present', () => {
      component['addEndRiskLevelField']();
      expect(component.form.contains('endRiskLevelName')).toBeTrue();

      component['addEndRiskLevelField']();
      expect(component.form.contains('endRiskLevelName')).toBeTrue();
    });

    it('should safely do nothing when removeEndRiskLevelField is called and control is absent', () => {
      component['removeEndRiskLevelField']();
      expect(component.form.contains('endRiskLevelName')).toBeFalse();
    });
  });

  describe('buildPayload branches', () => {
    it('should include endRiskLevelName when populated and build individual payload with single student', () => {
      component.isGroup.set(false);

      component.form = new FormGroup({
        type: new FormControl(InterventionType.Individual),
        students: new FormControl(1),
        date: new FormControl('2024-01-01'),
        activity: new FormControl('Activity'),
        area: new FormControl('Area'),
        mode: new FormControl('Online'),
        comments: new FormControl('comments'),
        uploadInput: new FormControl([]),
        riskLevelName: new FormControl('Low'),
        status: new FormControl('Remitted'),
        endRiskLevelName: new FormControl('High'),
      });

      const payload = component['buildPayload']();

      expect(payload.intervention['studentIds']).toEqual([1]);
      expect(payload.intervention['numberOfParticipants']).toBe(1);
      expect(payload.intervention['endRiskLevelName']).toBe('High');
    });

    it('should set endRiskLevelName to null when empty string', () => {
      component.form.addControl('endRiskLevelName', new FormControl(''));

      const payload = component['buildPayload']();

      expect(payload.intervention['endRiskLevelName']).toBeNull();
    });
  });

  describe('students value changes (auto switch to individual)', () => {
    it('should switch isGroup to false, reset attendance, and rebuild fields when selection drops below 2', fakeAsync(() => {
      component.ngOnInit();
      fixture.detectChanges();

      component['formSettling'] = false;

      component.form.get('students')?.setValue(['1']);

      tick();
      fixture.detectChanges();

      expect(component.isGroup()).toBeFalse();
      expect(component.form.get('type')?.value).toBe(InterventionType.Group);
    }));

    it('should preserve the remaining student instead of defaulting to studentIds[0]', fakeAsync(() => {
      component.ngOnInit();
      fixture.detectChanges();

      component['formSettling'] = false;

      component.form.get('students')?.setValue(['2']);

      tick();
      fixture.detectChanges();

      const studentsField = component.formFields.find(
        f => f.name === 'students'
      );

      const val = Array.isArray(studentsField?.value)
        ? studentsField?.value[0]
        : (studentsField?.value as unknown as number);

      expect(Number(val)).toBe(2);
    }));

    it('should not switch when 2 or more students remain selected', fakeAsync(() => {
      component.ngOnInit();
      tick();
      const fieldsBefore = component.formFields;

      component['formSettling'] = false;

      component.form.get('students')?.setValue(['1', '2']);
      tick();
      fixture.detectChanges();

      expect(component.isGroup()).toBeTrue();
      expect(component.formFields).toEqual(fieldsBefore);
    }));
  });

  it('should not append the end risk level field if it already exists', () => {
    component.ngOnInit();
    component['appendEndRiskLevelField']();
    const fieldsAfterFirstAppend = component.formFields;
    component['appendEndRiskLevelField']();
    expect(component.formFields).toBe(fieldsAfterFirstAppend);
    expect(
      component.formFields.filter(f => f.name === 'endRiskLevelName').length
    ).toBe(1);
  });

  it('should convert a single student id to a number when building the payload', () => {
    component.form.patchValue({
      students: ['123'],
      type: 'type',
      date: '2026-09-21',
      activity: 'activity',
      mode: 'mode',
      comments: 'comments',
      area: 'area',
      riskLevelName: 'Low',
      status: 'status',
      endRiskLevelName: '',
    });

    spyOn(component, 'isGroup').and.returnValue(false);
    spyOn(component, 'attendedStudentIds').and.returnValue([]);

    const payload = component['buildPayload']();

    expect(payload.intervention.studentIds).toEqual([123]);
  });

  it('should include endRiskLevelName when it has a value', () => {
    component.form.patchValue({
      students: ['123'],
      type: 'type',
      date: '2026-09-21',
      activity: 'activity',
      uploadInput: 'mode',
      comments: 'comments',
      professionalId: 'Abby',
      riskLevelName: 'Low',
      status: 'InProgress',
      endRiskLevelName: RiskLevels.High,
      area: 'New',
    });

    spyOn(component, 'isGroup').and.returnValue(false);
    spyOn(component, 'attendedStudentIds').and.returnValue([]);
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
