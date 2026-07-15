import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  InterventionModel,
  InterventionType,
} from '@core/models/assessment.model';
import { of } from 'rxjs';
import {
  NewInterventionDialogData,
  NewInterventionModalComponent,
} from './new-intervention-modal.component';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { InterventionService } from '@core/services/api/intervention.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('NewInterventionModalComponent', () => {
  let component: NewInterventionModalComponent;
  let fixture: ComponentFixture<NewInterventionModalComponent>;
  let mockInterventionService: jasmine.SpyObj<InterventionService>;
  let mockToastService: jasmine.SpyObj<ToastNotificationService>;
  let mockDialogRef: jasmine.SpyObj<
    MatDialogRef<NewInterventionModalComponent>
  >;

  const mockData: NewInterventionDialogData = {
    assessmentId: 1,
    professional: { label: 'Dr. Smith', value: '10' },
    students: [
      { label: 'Student A', value: 1 },
      { label: 'Student B', value: 2 },
    ],
  };

  beforeEach(async () => {
    mockInterventionService = jasmine.createSpyObj('InterventionService', [
      'createIntervention',
      'uploadAttachments',
    ]);
    mockToastService = jasmine.createSpyObj('ToastNotificationService', [
      'showToast',
    ]);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [NewInterventionModalComponent],
      providers: [
        { provide: InterventionService, useValue: mockInterventionService },
        { provide: ToastNotificationService, useValue: mockToastService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NewInterventionModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isGroup to true on init when more than one student', () => {
    component.ngOnInit();
    expect(component.isGroup()).toBeTrue();
  });

  it('should build form fields including students field on init', () => {
    component.ngOnInit();
    const names = component.formFields.map(f => f.name);
    expect(names).toContain('students');
    expect(names).toContain('date');
    expect(names).toContain('type');
  });

  it('should compute numberOfParticipants from data.students length', () => {
    expect(component.numberOfParticipants()).toBe(2);
  });

  it('should return true for isSubmitDisabled when form is not set', () => {
    expect(component.isSubmitDisabled).toBeTrue();
  });

  it('should close dialog without result on closeAndResetDialog', () => {
    component.closeAndResetDialog();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should return file name from a path', () => {
    const result = component.getFileName('folder/subfolder/file.pdf');
    expect(result).toBe('file.pdf');
  });

  it('should return empty string when path is undefined', () => {
    const result = component.getFileName(undefined as unknown as string);
    expect(result).toBe('');
  });

  it('should remove existing attachment and mark form dirty', () => {
    component.existingAttachments = ['folder/file1.pdf', 'folder/file2.pdf'];
    component.form = new FormGroup({});
    spyOn(component.form, 'markAsDirty');

    component.removeExistingAttachment(0);

    expect(component.attachmentsToDelete).toContain('file1.pdf');
    expect(component.existingAttachments).toEqual(['folder/file2.pdf']);
    expect(component.form.markAsDirty).toHaveBeenCalled();
  });

  it('should not call service when form is invalid on submitIntervention', () => {
    component.form = new FormGroup({
      date: new FormControl(null, Validators.required),
    });

    component.submitIntervention();

    expect(mockInterventionService.createIntervention).not.toHaveBeenCalled();
  });

  it('should call service and close dialog with true on successful submitIntervention', () => {
    component.ngOnInit();
    component.form = new FormGroup({
      date: new FormControl(new Date().toISOString()),
      type: new FormControl(InterventionType.Individual),
      activity: new FormControl('Activity'),
      area: new FormControl('Area'),
      mode: new FormControl('Mode'),
      students: new FormControl([
        { name: 'ana', email: 'an@mail.com' },
        { name: 'abi', email: 'abi@mail.com' },
      ]),
      riskLevelName: new FormControl('Low'),
      professionalId: new FormControl(10),
      uploadInput: new FormControl([]),
      comments: new FormControl('Some comments here'),
    });

    const created: InterventionModel = { id: 1 } as InterventionModel;
    mockInterventionService.createIntervention.and.returnValue(of(created));

    component.submitIntervention();

    expect(mockInterventionService.createIntervention).toHaveBeenCalled();
    expect(mockToastService.showToast).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });
});
