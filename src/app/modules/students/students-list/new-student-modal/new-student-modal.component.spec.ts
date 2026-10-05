import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMPTY, of, Subject, throwError } from 'rxjs';

import { StudentRegistrationModel } from '@core/models/student-registration.model';
import { StudentService } from '@core/services/api/student.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import {
  NewStudentModalComponent,
  NewStudentModalData,
} from './new-student-modal.component';

describe('NewStudentModalComponent', () => {
  let studentService: jasmine.SpyObj<StudentService>;
  let toastService: jasmine.SpyObj<ToastNotificationService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<NewStudentModalComponent>>;
  let guard: jasmine.SpyObj<UnsavedChangesGuardService>;

  const cohorts = [
    { label: 'Cohort A', value: 1 },
    { label: 'Cohort B', value: 2 },
  ];

  async function createComponent(data: NewStudentModalData): Promise<{
    fixture: ComponentFixture<NewStudentModalComponent>;
    component: NewStudentModalComponent;
  }> {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    const fixture = TestBed.createComponent(NewStudentModalComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  function fillRequired(component: NewStudentModalComponent): void {
    component.form.patchValue({
      firstName: 'Ana',
      lastName: 'Pérez',
      idPassportNumber: 'ab-123456',
      primaryEmail: 'ana@jala.university',
      cohortId: 1,
    });
    component.form.markAsDirty();
  }

  beforeEach(async () => {
    studentService = jasmine.createSpyObj('StudentService', [
      'createManualStudent',
      'updateStudentProfile',
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
    guard = jasmine.createSpyObj('UnsavedChangesGuardService', [
      'attach',
      'requestClose',
    ]);
    guard.requestClose.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [NewStudentModalComponent],
      providers: [
        provideHttpClient(),
        { provide: StudentService, useValue: studentService },
        { provide: ToastNotificationService, useValue: toastService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: UnsavedChangesGuardService, useValue: guard },
        { provide: MAT_DIALOG_DATA, useValue: { cohorts } },
      ],
    }).compileComponents();
  });

  describe('creating', () => {
    it('should expose the mandatory and the optional fields', async () => {
      const { component } = await createComponent({ cohorts });

      const names = component.formFields.map(f => f.name);
      expect(names).toContain('cohortId');
      expect(names.length).toBe(21);
      expect(component.title).toBe('New Student');
    });

    it('should require first name, last name, ID/passport, primary email and cohort', async () => {
      const { component } = await createComponent({ cohorts });

      const required = [
        'firstName',
        'lastName',
        'idPassportNumber',
        'primaryEmail',
        'cohortId',
      ];
      required.forEach(name =>
        expect(component.form.get(name)?.hasError('required'))
          .withContext(name)
          .toBeTrue()
      );
      expect(component.form.get('middleName')?.valid).toBeTrue();
      expect(component.form.get('secondaryEmail')?.valid).toBeTrue();
      expect(component.form.invalid).toBeTrue();
    });

    it('should reject whitespace-only required values', async () => {
      const { component } = await createComponent({ cohorts });

      component.form.get('firstName')?.setValue('   ');

      expect(component.form.get('firstName')?.hasError('required')).toBeTrue();
    });

    it('should validate formats', async () => {
      const { component } = await createComponent({ cohorts });

      component.form.patchValue({
        firstName: 'Ana3',
        idPassportNumber: '!!',
        primaryEmail: 'nope',
        mobileNumber: 'abc',
        dateOfBirth: new Date(Date.now() + 86_400_000),
      });

      expect(component.form.get('firstName')?.hasError('pattern')).toBeTrue();
      expect(
        component.form.get('idPassportNumber')?.hasError('pattern')
      ).toBeTrue();
      expect(
        component.form.get('primaryEmail')?.hasError('pattern')
      ).toBeTrue();
      expect(
        component.form.get('mobileNumber')?.hasError('pattern')
      ).toBeTrue();
      expect(
        component.form.get('dateOfBirth')?.hasError('futureDate')
      ).toBeTrue();
    });

    it('should reject a secondary email equal to the primary one, even if the primary changes later', async () => {
      const { component } = await createComponent({ cohorts });

      component.form.patchValue({
        primaryEmail: 'a@b.co',
        secondaryEmail: 'A@B.co',
      });
      expect(
        component.form.get('secondaryEmail')?.hasError('sameAsPrimary')
      ).toBeTrue();

      component.form.get('primaryEmail')?.setValue('other@b.co');
      expect(component.form.get('secondaryEmail')?.valid).toBeTrue();
    });

    it('should send a clean payload and close with true on success', async () => {
      const { component } = await createComponent({ cohorts });
      studentService.createManualStudent.and.returnValue(
        of({
          studentId: 9,
          firstName: 'Ana',
          lastName: 'Pérez',
        } as StudentRegistrationModel)
      );
      fillRequired(component);
      component.form.patchValue({
        middleName: '',
        city: '  Cochabamba  ',
        dateOfBirth: new Date(2000, 0, 5),
      });

      component.submit();

      const payload =
        studentService.createManualStudent.calls.mostRecent().args[0];
      expect(payload.firstName).toBe('Ana');
      expect(payload.cohortId).toBe(1);
      expect(payload.middleName).toBeNull();
      expect(payload.city).toBe('Cochabamba');
      expect(payload.dateOfBirth).toBe('2000-01-05');
      expect(payload.primaryEmail).toBe('ana@jala.university');
      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'success' })
      );
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should not submit while the form is invalid', async () => {
      const { component } = await createComponent({ cohorts });

      component.submit();

      expect(studentService.createManualStudent).not.toHaveBeenCalled();
    });

    it('should create only one student when submitted repeatedly', async () => {
      const { component } = await createComponent({ cohorts });
      const pending = new Subject<StudentRegistrationModel>();
      studentService.createManualStudent.and.returnValue(pending);
      fillRequired(component);

      component.submit();
      component.submit();
      component.submit();

      expect(studentService.createManualStudent).toHaveBeenCalledTimes(1);
      expect(component.isSubmitting).toBeTrue();
    });

    it('should show the server message and allow retrying on error', async () => {
      spyOn(console, 'error');
      const { component } = await createComponent({ cohorts });
      studentService.createManualStudent.and.returnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 409,
              error: 'A student with that email already exists.',
            })
        )
      );
      fillRequired(component);

      component.submit();

      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'A student with that email already exists.',
          type: 'error',
        }),
        true
      );
      expect(component.isSubmitting).toBeFalse();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('editing', () => {
    const student: StudentRegistrationModel = {
      studentId: 7,
      isImported: false,
      firstName: 'Ana',
      lastName: 'Pérez',
      idPassportNumber: 'AB-1',
      primaryEmail: 'ana@jala.university',
      dateOfBirth: '2000-01-05',
      city: 'Cochabamba',
    };

    it('should open read-only as the student profile', async () => {
      const { component } = await createComponent({ cohorts, student });

      expect(component.title).toBe('Student Profile');
      expect(component.isViewing).toBeTrue();
      expect(component.form.disabled).toBeTrue();
      expect(component.form.get('firstName')?.value).toBe('Ana');
    });

    it('should unlock the form when Edit is pressed', async () => {
      const { component } = await createComponent({ cohorts, student });

      component.startEditing();

      expect(component.isViewing).toBeFalse();
      expect(component.title).toBe('Edit Student');
      expect(component.form.enabled).toBeTrue();
    });

    it('should go back to read-only on cancel when nothing changed', async () => {
      const { component } = await createComponent({ cohorts, student });
      component.startEditing();

      component.cancelEditing();

      expect(component.isViewing).toBeTrue();
      expect(component.form.disabled).toBeTrue();
      expect(guard.requestClose).not.toHaveBeenCalled();
    });

    it('should ask before discarding pending changes on cancel', async () => {
      const { component } = await createComponent({ cohorts, student });
      component.startEditing();
      component.form.get('city')?.setValue('La Paz');
      component.form.markAsDirty();

      component.cancelEditing();

      expect(guard.requestClose).toHaveBeenCalled();
    });

    it('should prefill the form and omit the cohort field', async () => {
      const { component } = await createComponent({ cohorts, student });

      expect(component.title).toBe('Student Profile');
      expect(component.formFields.some(f => f.name === 'cohortId')).toBeFalse();
      expect(component.form.get('firstName')?.value).toBe('Ana');
      expect(component.form.get('city')?.value).toBe('Cochabamba');
      const dob = component.form.get('dateOfBirth')?.value as Date;
      expect([dob.getFullYear(), dob.getMonth(), dob.getDate()]).toEqual([
        2000, 0, 5,
      ]);
    });

    it('should update the profile of that student', async () => {
      const { component } = await createComponent({ cohorts, student });
      studentService.updateStudentProfile.and.returnValue(of(student));
      component.startEditing();
      component.form.get('city')?.setValue('La Paz');
      component.form.markAsDirty();

      component.submit();

      expect(studentService.updateStudentProfile).toHaveBeenCalledWith(
        7,
        jasmine.objectContaining({ city: 'La Paz', cohortId: null })
      );
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should open ready to complete when the student has no profile yet', async () => {
      const { component } = await createComponent({
        cohorts,
        student: { ...student, idPassportNumber: '', city: null },
        hasProfile: false,
      });

      expect(component.isViewing).toBeFalse();
      expect(component.form.enabled).toBeTrue();
      expect(component.form.get('firstName')?.value).toBe('Ana');
      expect(
        component.form.get('idPassportNumber')?.hasError('required')
      ).toBeTrue();
    });

    it('should close instead of going back to read-only when cancelling a new profile', async () => {
      const { component } = await createComponent({
        cohorts,
        student,
        hasProfile: false,
      });

      component.cancelEditing();

      expect(guard.requestClose).toHaveBeenCalled();
    });

    it('should save a profile for a student that did not have one', async () => {
      const { component } = await createComponent({
        cohorts,
        student: { ...student, idPassportNumber: '' },
        hasProfile: false,
      });
      studentService.updateStudentProfile.and.returnValue(of(student));
      component.form.get('idPassportNumber')?.setValue('XY-99');
      component.form.markAsDirty();

      component.submit();

      expect(studentService.updateStudentProfile).toHaveBeenCalledWith(
        7,
        jasmine.objectContaining({ idPassportNumber: 'XY-99' })
      );
    });

    it('should lock the name and email of imported students but still send them', async () => {
      const { component } = await createComponent({
        cohorts,
        student: { ...student, isImported: true },
      });
      studentService.updateStudentProfile.and.returnValue(of(student));
      component.startEditing();
      component.form.get('city')?.setValue('La Paz');
      component.form.markAsDirty();

      ['firstName', 'middleName', 'lastName', 'primaryEmail'].forEach(name =>
        expect(component.form.get(name)?.disabled).withContext(name).toBeTrue()
      );
      expect(component.form.get('city')?.enabled).toBeTrue();

      component.submit();

      expect(studentService.updateStudentProfile).toHaveBeenCalledWith(
        7,
        jasmine.objectContaining({ primaryEmail: 'ana@jala.university' })
      );
    });
  });

  describe('closing', () => {
    it('should attach the unsaved changes guard to the dirty state', async () => {
      const { component } = await createComponent({ cohorts });

      expect(guard.attach).toHaveBeenCalledWith(
        dialogRef,
        jasmine.any(Function)
      );
      const isDirty = guard.attach.calls.mostRecent().args[1];
      expect(isDirty()).toBeFalse();
      component.form.markAsDirty();
      expect(isDirty()).toBeTrue();
    });

    it('should ask the guard before closing', async () => {
      const { component } = await createComponent({ cohorts });

      component.requestClose();

      expect(guard.requestClose).toHaveBeenCalledWith(
        dialogRef,
        jasmine.any(Function)
      );
    });
  });
});
