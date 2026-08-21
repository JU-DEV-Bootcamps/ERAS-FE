import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  InterventionModel,
  InterventionType,
} from '@core/models/assessment.model';
import { of, throwError } from 'rxjs';
import {
  NewInterventionDialogData,
  NewInterventionModalComponent,
} from './new-intervention-modal.component';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { InterventionService } from '@core/services/api/intervention.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, tick } from '@angular/core/testing';

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

  const buildValidFormGroup = (overrides: Record<string, unknown> = {}) =>
    new FormGroup({
      date: new FormControl(overrides['date'] ?? new Date().toISOString()),
      type: new FormControl(overrides['type'] ?? InterventionType.Individual),
      activity: new FormControl(overrides['activity'] ?? 'Activity'),
      area: new FormControl(overrides['area'] ?? 'Area'),
      mode: new FormControl(overrides['mode'] ?? 'Mode'),
      students: new FormControl(overrides['students'] ?? [1]),
      riskLevelName: new FormControl(overrides['riskLevelName'] ?? 'Low'),
      professionalId: new FormControl(overrides['professionalId'] ?? 10),
      uploadInput: new FormControl(overrides['uploadInput'] ?? []),
      comments: new FormControl(overrides['comments'] ?? 'Some comments here'),
    });

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

  it('should set isGroup to false on init when only one student', () => {
    component.data = {
      ...mockData,
      students: [{ label: 'Student A', value: 1 }],
    };
    component.ngOnInit();
    expect(component.isGroup()).toBeFalse();
  });

  it('should build form fields including students field on init', () => {
    component.ngOnInit();
    const names = component.formFields.map(f => f.name);
    expect(names).toContain('students');
    expect(names).toContain('date');
    expect(names).toContain('type');
  });

  it('should disable the type field when there is only one student', () => {
    component.data = {
      ...mockData,
      students: [{ label: 'Student A', value: 1 }],
    };
    component.ngOnInit();
    const typeField = component.formFields.find(f => f.name === 'type');
    expect(typeField?.disabled).toBeTrue();
    expect(typeField?.value).toBe(InterventionType.Individual);
  });

  it('should use the single-select student field when there is only one student', () => {
    component.data = {
      ...mockData,
      students: [{ label: 'Student A', value: 1 }],
    };
    component.ngOnInit();
    const studentsField = component.formFields.find(f => f.name === 'students');
    expect(studentsField?.type).toBe('select');
    expect(studentsField?.multipleSelect).toBeUndefined();
  });

  it('should compute numberOfParticipants from data.students length', () => {
    expect(component.numberOfParticipants()).toBe(2);
  });

  it('should return true for isSubmitDisabled when form is not set', () => {
    expect(component.isSubmitDisabled).toBeTrue();
  });

  it('should return false for isSubmitDisabled when form is valid and dirty', () => {
    component.form = buildValidFormGroup();
    component.form.markAsDirty();
    expect(component.isSubmitDisabled).toBeFalse();
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

  describe('setFormGroup', () => {
    it('should toggle isGroup and rebuild fields when type changes to Individual', () => {
      component.ngOnInit(); // isGroup = true (2 students)
      const form = new FormGroup({
        type: new FormControl(InterventionType.Group),
      });
      component.setFormGroup(form);

      form.get('type')?.setValue(InterventionType.Individual);

      expect(component.isGroup()).toBeFalse();
      const studentsField = component.formFields.find(
        f => f.name === 'students'
      );
      expect(studentsField?.type).toBe('select');
    });

    it('should toggle isGroup and rebuild fields when type changes to Group', () => {
      component.data = {
        ...mockData,
        students: [{ label: 'Student A', value: 1 }],
      };
      component.ngOnInit(); // isGroup = false (1 student)
      const form = new FormGroup({
        type: new FormControl(InterventionType.Individual),
      });
      component.setFormGroup(form);

      form.get('type')?.setValue(InterventionType.Group);

      expect(component.isGroup()).toBeTrue();
      const studentsField = component.formFields.find(
        f => f.name === 'students'
      );
      expect(studentsField?.type).toBe('searchableSelect');
    });

    it('should not rebuild fields when type value does not change the group state', () => {
      component.ngOnInit();
      const form = new FormGroup({
        type: new FormControl(InterventionType.Group),
      });
      component.setFormGroup(form);
      const fieldsBefore = component.formFields;

      form.get('type')?.setValue(InterventionType.Group);

      expect(component.formFields).toBe(fieldsBefore);
    });
  });

  describe('selectedStudentCount', () => {
    it('should return 1 when the intervention is not a group', () => {
      component.ngOnInit();
      component.isGroup.set(false);
      expect(component.selectedStudentCount()).toBe(1);
    });

    it('should return data.students.length when form is not set', () => {
      component.ngOnInit();
      component.isGroup.set(true);
      expect(component.selectedStudentCount()).toBe(mockData.students.length);
    });

    it('should return data.students.length when the students control is missing', () => {
      component.ngOnInit();
      component.isGroup.set(true);
      component.form = new FormGroup({});
      expect(component.selectedStudentCount()).toBe(mockData.students.length);
    });

    it('should return the selected students length from the form when group', () => {
      component.ngOnInit();
      component.isGroup.set(true);
      component.form = new FormGroup({
        students: new FormControl([1]),
      });
      expect(component.selectedStudentCount()).toBe(1);
    });

    it('should fall back to data.students.length when the selection is empty', () => {
      component.ngOnInit();
      component.isGroup.set(true);
      component.form = new FormGroup({
        students: new FormControl([]),
      });
      expect(component.selectedStudentCount()).toBe(mockData.students.length);
    });
  });

  describe('submitIntervention', () => {
    it('should not call service when form is invalid', () => {
      component.form = new FormGroup({
        date: new FormControl(null, Validators.required),
      });

      component.submitIntervention();

      expect(mockInterventionService.createIntervention).not.toHaveBeenCalled();
    });

    it('should call service and close dialog with true on successful submitIntervention', () => {
      component.ngOnInit();
      component.form = buildValidFormGroup({
        type: InterventionType.Individual,
        students: [
          { name: 'ana', email: 'an@mail.com' },
          { name: 'abi', email: 'abi@mail.com' },
        ],
      });

      const created: InterventionModel = { id: 1 } as InterventionModel;
      mockInterventionService.createIntervention.and.returnValue(of(created));

      component.submitIntervention();

      expect(mockInterventionService.createIntervention).toHaveBeenCalled();
      expect(mockToastService.showToast).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should upload attachments before closing when files were added', () => {
      component.ngOnInit();
      const file = new File(['content'], 'evidence.pdf');
      component.form = buildValidFormGroup({ uploadInput: [file] });

      const created: InterventionModel = { id: 7 } as InterventionModel;
      mockInterventionService.createIntervention.and.returnValue(of(created));
      mockInterventionService.uploadAttachments.and.returnValue(
        of(['evidence.pdf'])
      );

      component.submitIntervention();

      expect(mockInterventionService.uploadAttachments).toHaveBeenCalledWith(
        7,
        [file]
      );
      expect(mockToastService.showToast).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should show an error toast and reset isSubmitting when createIntervention fails', () => {
      component.ngOnInit();
      component.form = buildValidFormGroup();

      const errorResponse = {
        statusText: 'Bad Request',
        error: { title: 'Invalid data' },
      } as unknown as HttpErrorResponse;
      mockInterventionService.createIntervention.and.returnValue(
        throwError(() => errorResponse)
      );

      component.submitIntervention();

      expect(mockToastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Form Submission Failed',
          message: 'Bad Request: Invalid data',
        }),
        true
      );
      expect(component.isSubmitting).toBeFalse();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should use a fallback message when the error has no title', () => {
      component.ngOnInit();
      component.form = buildValidFormGroup();

      const errorResponse = {
        statusText: 'Server Error',
        error: {},
      } as unknown as HttpErrorResponse;
      mockInterventionService.createIntervention.and.returnValue(
        throwError(() => errorResponse)
      );

      component.submitIntervention();

      expect(mockToastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message:
            'Server Error: There was an error submitting the form. Please try again later.',
        }),
        true
      );
    });

    describe('students value changes (auto switch to individual)', () => {
      it('should switch isGroup to false and update the type control when selection drops below 2', fakeAsync(() => {
        component.ngOnInit(); // isGroup = true (2 students)
        const form = new FormGroup({
          type: new FormControl(InterventionType.Group),
          students: new FormControl<number | number[] | null>([1, 2]),
        });
        component.setFormGroup(form);

        form.get('students')?.setValue([1]);
        tick();

        expect(component.isGroup()).toBeFalse();
        expect(form.get('type')?.value).toBe(InterventionType.Individual);
      }));

      it('should rebuild fields with the single-select students field', fakeAsync(() => {
        component.ngOnInit();
        const form = new FormGroup({
          type: new FormControl(InterventionType.Group),
          students: new FormControl<number | number[] | null>([1, 2]),
        });
        component.setFormGroup(form);

        form.get('students')?.setValue([1]);
        tick();

        const studentsField = component.formFields.find(
          f => f.name === 'students'
        );
        expect(studentsField?.type).toBe('select');
        expect(studentsField?.multipleSelect).toBeUndefined();
      }));

      it('should preserve the remaining student instead of defaulting to the first roster student', fakeAsync(() => {
        component.ngOnInit();
        const form = new FormGroup({
          type: new FormControl(InterventionType.Group),
          students: new FormControl<number | number[] | null>([1, 2]),
        });
        component.setFormGroup(form);

        form.get('students')?.setValue([2]);
        tick();

        const studentsField = component.formFields.find(
          f => f.name === 'students'
        );
        expect(studentsField?.value).toBe(2);
        expect(form.get('students')?.value).toBe(2);
      }));

      it('should not switch when 2 or more students remain selected', () => {
        component.ngOnInit();
        const form = new FormGroup({
          type: new FormControl(InterventionType.Group),
          students: new FormControl<number | number[] | null>([1, 2]),
        });
        component.setFormGroup(form);
        const fieldsBefore = component.formFields;

        form.get('students')?.setValue([1, 2]);

        expect(component.isGroup()).toBeTrue();
        expect(component.formFields).toBe(fieldsBefore);
      });

      it('should not react to students changes when already individual', () => {
        component.data = {
          ...mockData,
          students: [{ label: 'Student A', value: 1 }],
        };
        component.ngOnInit(); // isGroup = false (1 student)
        const form = new FormGroup({
          type: new FormControl(InterventionType.Individual),
          students: new FormControl<number | number[] | null>(1),
        });
        component.setFormGroup(form);
        const fieldsBefore = component.formFields;

        form.get('students')?.setValue(1);

        expect(component.formFields).toBe(fieldsBefore);
      });
    });
  });
});
