import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMPTY, of, throwError } from 'rxjs';

import { StudentInterventionModel } from '@core/models/student-intervention.model';
import { StudentInterventionService } from '@core/services/api/student-intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import {
  StudentInterventionFormDialogData,
  StudentInterventionFormModalComponent,
} from './student-intervention-form-modal.component';

const savedEntry: StudentInterventionModel = {
  id: 10,
  studentId: 1,
  kind: 'RiskIdentified',
  type: 'Academic',
  description: 'Failed two midterms',
  entryDate: '2026-10-20',
  createdBy: 'ana-sub',
  createdByName: 'Ana Pérez',
  createdAt: '2026-10-20T09:00:00Z',
};

describe('StudentInterventionFormModalComponent', () => {
  let fixture: ComponentFixture<StudentInterventionFormModalComponent>;
  let component: StudentInterventionFormModalComponent;
  let service: jasmine.SpyObj<StudentInterventionService>;
  let toast: jasmine.SpyObj<ToastNotificationService>;
  let dialogRef: jasmine.SpyObj<
    MatDialogRef<StudentInterventionFormModalComponent>
  >;
  let guard: jasmine.SpyObj<UnsavedChangesGuardService>;

  const create = (data: StudentInterventionFormDialogData) => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    fixture = TestBed.createComponent(StudentInterventionFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    service = jasmine.createSpyObj('StudentInterventionService', [
      'create',
      'update',
    ]);
    toast = jasmine.createSpyObj('ToastNotificationService', ['showToast']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', [
      'close',
      'backdropClick',
      'keydownEvents',
    ]);
    dialogRef.backdropClick.and.returnValue(EMPTY);
    dialogRef.keydownEvents.and.returnValue(EMPTY);
    guard = jasmine.createSpyObj('UnsavedChangesGuardService', [
      'attach',
      'requestClose',
    ]);
    guard.requestClose.and.returnValue(of(true));

    TestBed.configureTestingModule({
      imports: [StudentInterventionFormModalComponent],
      providers: [
        provideNoopAnimations(),
        { provide: StudentInterventionService, useValue: service },
        { provide: ToastNotificationService, useValue: toast },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: UnsavedChangesGuardService, useValue: guard },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    });
  });

  it('[643-add-student-interventions/AC-5] shows required errors and does not submit an empty form', () => {
    // GIVEN an ERAS Professional with the add-entry form open and nothing filled in
    create({ studentId: 1, kind: 'RiskIdentified' });

    // WHEN they try to save
    component.submit();
    fixture.detectChanges();

    // THEN the form is not submitted and Type, Description and Date each show they are required
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Type is required.');
    expect(text).toContain('Description is required.');
    expect(text).toContain('Date is required.');
    expect(service.create).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
  });

  it('offers only the types of the kind it was opened for', () => {
    create({ studentId: 1, kind: 'SupportReceived' });

    const typeField = component.formFields.find(field => field.name === 'type');

    expect(typeField?.options?.map(option => option.value)).toEqual([
      'Tutoring',
      'Advising',
      'FinancialAid',
      'Referral',
    ]);
  });

  it('creates the entry with the form values and closes with the saved entry', () => {
    service.create.and.returnValue(of(savedEntry));
    create({ studentId: 1, kind: 'RiskIdentified' });
    component.form.patchValue({
      type: 'Academic',
      entryDate: new Date(2026, 9, 20),
      description: '  Failed two midterms  ',
    });
    component.form.markAsDirty();

    component.submit();

    expect(service.create).toHaveBeenCalledOnceWith(1, {
      kind: 'RiskIdentified',
      type: 'Academic',
      description: 'Failed two midterms',
      entryDate: '2026-10-20',
    });
    expect(dialogRef.close).toHaveBeenCalledWith(savedEntry);
  });

  it('opens an existing entry prefilled and updates it', () => {
    service.update.and.returnValue(
      of({ ...savedEntry, description: 'Changed' })
    );
    create({ studentId: 1, kind: 'RiskIdentified', entry: savedEntry });

    expect(component.form.value.type).toBe('Academic');
    expect(component.form.value.description).toBe('Failed two midterms');
    component.form.patchValue({ description: 'Changed' });

    component.submit();

    expect(service.update).toHaveBeenCalledOnceWith(1, 10, {
      kind: 'RiskIdentified',
      type: 'Academic',
      description: 'Changed',
      entryDate: '2026-10-20',
    });
    expect(service.create).not.toHaveBeenCalled();
  });

  it('rejects a blank description and one over 1000 characters', () => {
    create({ studentId: 1, kind: 'RiskIdentified' });
    const description = component.form.get('description')!;

    description.setValue('   ');
    expect(description.hasError('required')).toBeTrue();

    description.setValue('a'.repeat(1001));
    expect(description.hasError('maxlength')).toBeTrue();

    description.setValue('a'.repeat(1000));
    expect(description.valid).toBeTrue();
  });

  it('shows an error toast and stays open when saving fails', () => {
    service.create.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );
    spyOn(console, 'error');
    create({ studentId: 1, kind: 'RiskIdentified' });
    component.form.patchValue({
      type: 'Academic',
      entryDate: new Date(2026, 9, 20),
      description: 'Failed',
    });

    component.submit();

    expect(toast.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: 'error' }),
      true
    );
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBeFalse();
  });
});
