import { FormControl, FormGroup } from '@angular/forms';
import {
  InterventionModel,
  InterventionType,
} from '@core/models/assessment.model';
import { of, EMPTY } from 'rxjs';
import {
  NewInterventionDialogData,
  NewInterventionModalComponent,
} from './new-intervention-modal.component';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { InterventionService } from '@core/services/api/intervention.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DynamicField } from '@core/factories/forms/form-factory.interface';

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

  async function createComponentWithData(data: NewInterventionDialogData) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NewInterventionModalComponent],
      providers: [
        { provide: InterventionService, useValue: mockInterventionService },
        { provide: ToastNotificationService, useValue: mockToastService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
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
    const oneStudentData = {
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
    const oneStudentData = {
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
    const oneStudentData = {
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

  it('should return true for isSubmitDisabled when form is not set', () => {
    component.form = undefined as unknown as FormGroup;
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
  });

  describe('selectedStudentCount', () => {
    it('should return 0 when form is not set (new defensive logic)', () => {
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
        students: new FormControl([1]),
      });
      expect(component.selectedStudentCount()).toBe(1);
    });

    it('should return 0 when the selection is empty and is group', () => {
      component.isGroup.set(true);
      component.form = new FormGroup({
        students: new FormControl([]),
      });
      expect(component.selectedStudentCount()).toBe(0);
    });
  });

  describe('submitIntervention', () => {
    it('should call service and close dialog with true on successful submitIntervention', () => {
      component.form = buildValidFormGroup({
        type: InterventionType.Individual,
        students: [1],
      });

      const created: InterventionModel = { id: 1 } as InterventionModel;
      mockInterventionService.createIntervention.and.returnValue(of(created));

      component.submitIntervention();

      expect(mockInterventionService.createIntervention).toHaveBeenCalled();
      expect(mockToastService.showToast).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    describe('students value changes (auto switch to individual)', () => {
      it('should switch isGroup to false and update the type control when selection drops below 2', fakeAsync(() => {
        component.isGroup.set(true);
        const form = new FormGroup({
          type: new FormControl(InterventionType.Group),
          students: new FormControl([1, 2]),
        });
        component['formSettling'] = false;
        component.setFormGroup(form);

        form.get('students')?.setValue([1]);
        tick();
        fixture.detectChanges();

        expect(component.isGroup()).toBeFalse();
        expect(form.get('type')?.value).toBe(InterventionType.Individual);
      }));

      it('should preserve the remaining student instead of defaulting to the first roster student', fakeAsync(() => {
        component.isGroup.set(true);
        const form = new FormGroup({
          type: new FormControl(InterventionType.Group),
          students: new FormControl([1, 2]),
        });

        component['formSettling'] = false;
        component.setFormGroup(form);

        form.get('students')?.setValue([2]);

        tick();
        fixture.detectChanges();

        const studentsField = component.formFields.find(
          (f: DynamicField) => f.name === 'students'
        );
        const finalValue = studentsField?.value as unknown as number;

        expect(finalValue).toBe(2);
      }));
    });
  });
});
