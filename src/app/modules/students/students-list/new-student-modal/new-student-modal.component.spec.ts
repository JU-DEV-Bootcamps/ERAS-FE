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

    it('should offer countries as dropdowns and keep the state disabled until a country is chosen', async () => {
      const { component } = await createComponent({ cohorts });
      const field = (name: string) =>
        component.formFields.find(f => f.name === name)!;

      ['nationality', 'countryOfBirth', 'country', 'stateProvince'].forEach(
        name => expect(field(name).type).withContext(name).toBe('select')
      );
      expect(field('country').options!.length).toBeGreaterThan(200);
      expect(field('stateProvince').options).toEqual([]);
      expect(component.form.get('stateProvince')?.disabled).toBeTrue();
    });

    it('should list only the states of the chosen country and clear the old one', async () => {
      const { component } = await createComponent({ cohorts });
      const stateField = component.formFields.find(
        f => f.name === 'stateProvince'
      )!;

      component.form.get('country')?.setValue('Bolivia');
      expect(component.form.get('stateProvince')?.enabled).toBeTrue();
      expect(stateField.options!.map(o => o.label)).toContain('La Paz');

      component.form.get('stateProvince')?.setValue('La Paz');
      component.form.get('country')?.setValue('Peru');

      expect(component.form.get('stateProvince')?.value).toBe('');
      expect(stateField.options!.map(o => o.label)).not.toContain('La Paz');
      expect(stateField.options!.length).toBeGreaterThan(0);
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

    it('[686-edit-focused-student-profile-modal/AC-10] creates a student from the New Student modal', async () => {
      // GIVEN an ERAS Administrator who opens "New Student"
      const { fixture, component } = await createComponent({ cohorts });
      studentService.createManualStudent.and.returnValue(
        of({ studentId: 9, firstName: 'Ana' } as StudentRegistrationModel)
      );

      // THEN, before saving, the modal shows the title and the cohort selector, and no Edit button
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('h2')?.textContent?.trim()).toBe('New Student');
      expect(component.formFields.map(f => f.name)).toContain('cohortId');
      const buttons = Array.from(el.querySelectorAll('button')).map(b =>
        b.textContent?.trim()
      );
      expect(buttons).not.toContain('Edit');

      // WHEN they fill the required fields, select the cohort and press Save
      fillRequired(component);
      component.submit();

      // THEN the student is created, the modal closes and a success message is shown
      expect(studentService.createManualStudent).toHaveBeenCalledTimes(1);
      expect(dialogRef.close).toHaveBeenCalledWith(true);
      expect(toastService.showToast).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'success' })
      );
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
