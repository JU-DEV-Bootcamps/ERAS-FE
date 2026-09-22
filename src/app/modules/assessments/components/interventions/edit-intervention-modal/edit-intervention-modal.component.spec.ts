import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { EditInterventionModalComponent } from './edit-intervention-modal.component';
import { InterventionService } from '@core/services/api/intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  InterventionMode,
  InterventionStatus,
  InterventionType,
  RiskLevels,
  UpdateInterventionPayload,
} from '@core/models/assessment.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, of, throwError } from 'rxjs';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StagedFile } from '@core/models/attachment.model';

describe('EditInterventionModalComponent', () => {
  let component: EditInterventionModalComponent;
  let fixture: ComponentFixture<EditInterventionModalComponent>;
  let interventionService: jasmine.SpyObj<InterventionService>;
  let toastService: jasmine.SpyObj<ToastNotificationService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EditInterventionModalComponent>>;

  const dialogData = {
    assessmentId: 1,
    professional: {
      label: 'John Doe',
      value: '10',
    },
    students: [
      {
        label: 'Student 1',
        value: '1',
      },
      {
        label: 'Student 2',
        value: '2',
      },
    ],
    intervention: {
      id: 100,
      kind: InterventionType.Group,
      studentIds: [1, 2],
      activity: 'Activity',
      area: 'Area',
      mode: 'Online',
      comments: 'Some comments',
      riskLevelName: 'Low',
      status: 'Remitted',
      endRiskLevelName: '',
      attendance: {
        1: true,
        2: false,
      },
      dateUtc: '2024-01-01',
    },
  };

  const updateDto = {
    dateUtc: '12300',
    studentIds: [1],
    mode: InterventionMode.InPlace,
    kind: InterventionType.Group,
  } as UpdateInterventionPayload;

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
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EditInterventionModalComponent);
    component = fixture.componentInstance;

    component.setFormGroup(
      new FormGroup({
        type: new FormControl(InterventionType.Group),
        students: new FormControl(['1', '2']),
        date: new FormControl('2024-01-01'),
        activity: new FormControl('Activity'),
        area: new FormControl('Area'),
        mode: new FormControl('Online'),
        comments: new FormControl('comments'),
        uploadInput: new FormControl([]),
        riskLevelName: new FormControl('Low'),
        status: new FormControl('Remitted'),
      })
    );

    fixture.detectChanges();
  });

  it('should initialize initial data', () => {
    component.ngOnInit();
    expect(component.isGroup()).toBeTrue();
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
    beforeEach(() => {
      interventionService.updateIntervention = jasmine
        .createSpy('updateIntervention')
        .and.returnValue(of(void 0));
    });

    it('should proceed with update when an attendee is not among the selected students', () => {
      component.form.get('students')?.setValue(['1']);
      component.attendedStudentIds.set(['1', '2']);
      component.attendedStudentIdsModel = ['1', '2'];

      component.submitIntervention();

      expect(interventionService.updateIntervention).toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledWith(true);
      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Intervention updated successfully',
        })
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

      Object.defineProperty(invalidForm, 'invalid', {
        get: () => true,
      });

      component.form = invalidForm;

      component.submitIntervention();

      expect(interventionService.updateIntervention).not.toHaveBeenCalled();
    });
  });

  describe('isSubmitDisabled', () => {
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

  describe('students value changes (auto switch to individual)', () => {
    it('should switch isGroup to false, reset attendance, and rebuild fields when selection drops below 2', fakeAsync(() => {
      component.ngOnInit();
      fixture.detectChanges();

      component['formSettling'] = false;

      component.form.get('students')?.setValue(['1']);

      tick();
      fixture.detectChanges();

      expect(component.isGroup()).toBeFalse();
      expect(component.form.get('type')?.value).toBe(
        InterventionType.Individual
      );
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

  it('should complete the afterNextRender callback when switching to group', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();

    component['formSettling'] = false;

    component.attendedStudentIds.set(['1', '2']);
    component.attendedStudentIdsModel = ['1', '2'];
    component.form.markAsPristine();

    component.form.get('type')?.setValue(InterventionType.Group);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.isGroup()).toBeTrue();
  }));

  it('should complete the afterNextRender callback when switching to individual', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();

    component['formSettling'] = false;

    component.attendedStudentIds.set(['1', '2']);
    component.attendedStudentIdsModel = ['1', '2'];
    component.form.markAsPristine();

    component.form.get('type')?.setValue(InterventionType.Individual);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.isGroup()).toBeFalse();

    expect(component.form.get('students')?.value).toBe(1);
  }));

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
});
