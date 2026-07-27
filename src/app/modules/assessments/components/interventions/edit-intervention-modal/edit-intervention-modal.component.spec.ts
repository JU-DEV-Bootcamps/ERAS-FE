import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditInterventionModalComponent } from './edit-intervention-modal.component';
import { InterventionService } from '@core/services/api/intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  InterventionStatus,
  InterventionType,
} from '@core/models/assessment.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

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
      attachments: ['folder/file1.pdf', 'folder/file2.pdf'],
      attendance: {
        1: true,
        2: false,
      },
      dateUtc: '2024-01-01',
    },
  };

  beforeEach(async () => {
    interventionService = jasmine.createSpyObj('InterventionService', [
      'deleteAttachment',
      'getByAssessment',
      'upsertInterventions',
      'uploadAttachments',
    ]);

    toastService = jasmine.createSpyObj('ToastNotificationService', [
      'showToast',
    ]);

    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    interventionService.getByAssessment.and.returnValue(of([]));
    interventionService.upsertInterventions.and.returnValue(of([]));
    interventionService.uploadAttachments.and.returnValue(of(['']));

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
    expect(component.existingAttachments.length).toBe(2);
  });

  it('should update attendance', () => {
    component.onAttendanceChange(['2']);

    expect(component.attendedStudentIds()).toEqual(['2']);
    expect(component.form.dirty).toBeTrue();
  });

  it('should remove attachment', () => {
    component.removeExistingAttachment(0);

    expect(component.existingAttachments.length).toBe(1);
    expect(component.attachmentsToDelete).toEqual(['file1.pdf']);
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

  it('should update successfully', () => {
    component['updateIntervention']();

    expect(interventionService.getByAssessment).toHaveBeenCalled();
    expect(interventionService.upsertInterventions).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
    expect(toastService.showToast).toHaveBeenCalled();
  });

  it('should return an empty array when uploadInput is empty', () => {
    component.form.get('uploadInput')?.setValue([]);
    const result = component['getNewFilesToUpload']();
    expect(result).toEqual([]);
  });

  it('should return only new files', () => {
    const existingFile = new File(['a'], 'existing.pdf');
    const newFile = new File(['b'], 'new.pdf');
    component.form.get('uploadInput')?.setValue([existingFile, newFile]);
    component.existingAttachments = ['existing.pdf'];
    const result = component['getNewFilesToUpload']();
    expect(result).toEqual([newFile]);
  });

  it('should return getFileName', () => {
    const url = 'something/folder/found.pdf';
    const result = component['getFileName'](url);
    expect(result).toEqual('found.pdf');
  });

  it('should return the same fileName', () => {
    const result = component['getFileName']('');
    expect(result).toEqual('');
  });

  it('should return empty string if there is no path provided', () => {
    const result = component['getFileName'](undefined as unknown as string);
    expect(result).toEqual('');
  });

  it('should handle update error', () => {
    interventionService.getByAssessment.and.returnValue(
      throwError(() => ({
        statusText: 'Bad Request',
        error: {
          title: 'Failure',
        },
      }))
    );

    component['updateIntervention']();

    expect(toastService.showToast).toHaveBeenCalled();
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
});
