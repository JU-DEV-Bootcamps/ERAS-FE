import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMPTY, of, Subject, throwError } from 'rxjs';

import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { StudentRegistrationModel } from '@core/models/student-registration.model';
import { StudentService } from '@core/services/api/student.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { StudentInterventionsComponent } from '../student-interventions/student-interventions.component';
import { StudentProfileViewComponent } from '../student-profile-view/student-profile-view.component';
import {
  NewStudentModalComponent,
  NewStudentModalData,
} from './new-student-modal.component';

/** The Interventions section has its own spec; here it only has to be placed in the record, under its heading. */
@Component({
  selector: 'app-student-interventions',
  template: '<h3>Interventions</h3>',
})
class StubStudentInterventionsComponent {
  readonly studentId = input.required<number>();
}

describe('NewStudentModalComponent', () => {
  let studentService: jasmine.SpyObj<StudentService>;
  let toastService: jasmine.SpyObj<ToastNotificationService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<NewStudentModalComponent>>;
  let guard: jasmine.SpyObj<UnsavedChangesGuardService>;
  let permissions: jasmine.SpyObj<PermissionsService>;

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
    permissions = jasmine.createSpyObj<PermissionsService>(
      'PermissionsService',
      ['can']
    );
    permissions.can.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [NewStudentModalComponent],
      providers: [
        provideHttpClient(),
        { provide: StudentService, useValue: studentService },
        { provide: ToastNotificationService, useValue: toastService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: UnsavedChangesGuardService, useValue: guard },
        { provide: PermissionsService, useValue: permissions },
        { provide: MAT_DIALOG_DATA, useValue: { cohorts } },
      ],
    })
      .overrideComponent(NewStudentModalComponent, {
        remove: { imports: [StudentInterventionsComponent] },
        add: { imports: [StubStudentInterventionsComponent] },
      })
      .overrideComponent(StudentProfileViewComponent, {
        remove: { imports: [StudentInterventionsComponent] },
        add: { imports: [StubStudentInterventionsComponent] },
      })
      .compileComponents();
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
      const { fixture, component } = await createComponent({
        cohorts,
        student,
      });
      const el = fixture.nativeElement as HTMLElement;

      expect(component.title).toBe('Student Profile');
      expect(component.isViewing).toBeTrue();
      expect(el.querySelector('app-student-profile-view')).not.toBeNull();
      expect(el.querySelector('app-form-factory')).toBeNull();
    });

    it('should keep a previously typed value visible and the state list tied to the saved country', async () => {
      const { component } = await createComponent({
        cohorts,
        student: {
          ...student,
          country: 'Bolivia',
          stateProvince: 'Murillo',
          nationality: 'Bolivian',
        },
      });
      const field = (name: string) =>
        component.formFields.find(f => f.name === name)!;

      expect(field('stateProvince').options!.map(o => o.value)).toContain(
        'Murillo'
      );
      expect(field('stateProvince').options!.map(o => o.value)).toContain(
        'La Paz'
      );
      expect(field('nationality').options!.map(o => o.value)).toContain(
        'Bolivian'
      );
    });

    it('should unlock the form when Edit is pressed', async () => {
      const { fixture, component } = await createComponent({
        cohorts,
        student,
      });

      component.startEditing();
      fixture.detectChanges();

      expect(component.isViewing).toBeFalse();
      expect(component.title).toBe('Edit Student');
      expect(component.form.enabled).toBeTrue();
    });

    it('should go back to read-only on cancel when nothing changed', async () => {
      const { fixture, component } = await createComponent({
        cohorts,
        student,
      });
      const el = fixture.nativeElement as HTMLElement;
      component.startEditing();
      fixture.detectChanges();

      component.cancelEditing();
      fixture.detectChanges();

      expect(component.isViewing).toBeTrue();
      expect(el.querySelector('app-student-profile-view')).not.toBeNull();
      expect(el.querySelector('app-form-factory')).toBeNull();
      expect(guard.requestClose).not.toHaveBeenCalled();
    });

    it('should ask before discarding pending changes on cancel', async () => {
      const { fixture, component } = await createComponent({
        cohorts,
        student,
      });
      component.startEditing();
      fixture.detectChanges();
      component.form.get('city')?.setValue('La Paz');
      component.form.markAsDirty();

      component.cancelEditing();

      expect(guard.requestClose).toHaveBeenCalled();
    });

    it('should prefill the form and omit the cohort field', async () => {
      const { fixture, component } = await createComponent({
        cohorts,
        student,
      });
      component.startEditing();
      fixture.detectChanges();

      expect(component.title).toBe('Edit Student');
      expect(component.formFields.some(f => f.name === 'cohortId')).toBeFalse();
      expect(component.form.get('firstName')?.value).toBe('Ana');
      expect(component.form.get('city')?.value).toBe('Cochabamba');
      const dob = component.form.get('dateOfBirth')?.value as Date;
      expect([dob.getFullYear(), dob.getMonth(), dob.getDate()]).toEqual([
        2000, 0, 5,
      ]);
    });

    it('should update the profile of that student', async () => {
      const { fixture, component } = await createComponent({
        cohorts,
        student,
      });
      studentService.updateStudentProfile.and.returnValue(of(student));
      component.startEditing();
      fixture.detectChanges();
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
      const { fixture, component } = await createComponent({
        cohorts,
        student: { ...student, isImported: true },
      });
      studentService.updateStudentProfile.and.returnValue(of(student));
      component.startEditing();
      fixture.detectChanges();
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

  describe('interventions section', () => {
    const existing: NewStudentModalData = {
      cohorts,
      student: {
        studentId: 7,
        firstName: 'Ana',
        lastName: 'Torres',
        idPassportNumber: 'A1',
        primaryEmail: 'ana@jala.university',
      },
      hasProfile: true,
    };

    it('should show the Interventions section of an existing student', async () => {
      const { fixture } = await createComponent(existing);

      const section = (fixture.nativeElement as HTMLElement).querySelector(
        'app-student-interventions'
      );
      expect(section).not.toBeNull();
    });

    it('should not show the section while creating a student', async () => {
      const { fixture } = await createComponent({ cohorts });

      const section = (fixture.nativeElement as HTMLElement).querySelector(
        'app-student-interventions'
      );
      expect(section).toBeNull();
    });
  });

  describe('for a user who cannot manage students', () => {
    const withoutProfile: NewStudentModalData = {
      cohorts,
      student: {
        studentId: 7,
        firstName: 'Ana',
        lastName: 'Torres',
        idPassportNumber: 'A1',
        primaryEmail: 'ana@jala.university',
      },
      hasProfile: false,
    };

    it('should open read-only even when the student has no profile yet, without an Edit button', async () => {
      permissions.can.and.returnValue(false);

      const { fixture, component } = await createComponent(withoutProfile);

      expect(component.isViewing).toBeTrue();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(
          '[data-testid="edit-student"]'
        )
      ).toBeNull();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('app-form-factory')
      ).toBeNull();
    });

    it('should not let startEditing unlock the form', async () => {
      permissions.can.and.returnValue(false);
      const { fixture, component } = await createComponent(withoutProfile);

      component.startEditing();
      fixture.detectChanges();

      expect(component.isViewing).toBeTrue();
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('app-form-factory')
      ).toBeNull();
    });
  });

  describe('agreed profile attributes', () => {
    const profile: StudentProfileSummaryModel = {
      studentId: 7,
      isImported: false,
      firstName: 'Ana',
      lastName: 'Torres',
      idPassportNumber: 'ID-777777',
      primaryEmail: 'ana.torres@jala.university',
      sisId: 'S-1001',
      mobileNumber: '+506 8888 0000',
      country: 'Costa Rica',
      cohortId: 1,
      cohortName: 'Cohort A',
      cgpa: 3.4,
      sapStatus: 'Satisfactory',
      passedCoursesCount: 7,
      failedCoursesCount: 1,
      currentCourses: [{ name: 'Algorithms', group: 'A', section: '2' }],
      dateOfBirth: '2001-05-04',
      gender: 'Female',
      nationality: 'Costa Rican',
      countryOfBirth: 'Panama',
      secondaryEmail: 'secondary@example.com',
      stateProvince: 'San José',
      city: 'Heredia',
      street: 'Calle 5',
      postalCode: '10101',
      levelOfStudy: 'Bachelor',
      facultySchool: 'Engineering',
      studyModality: 'Hybrid',
      previousInstitution: 'Old School',
      identifiedRisks: ['Low attendance'],
      supportReceived: ['Tutoring'],
    };

    it('[641-align-student-modal-fields/AC-2] shows the three sections in order when opened for viewing', async () => {
      // GIVEN a user with an ERAS role and a student with profile data
      // WHEN they open the student record for viewing
      const { fixture, component } = await createComponent({
        cohorts,
        student: profile,
        hasProfile: true,
      });
      const el = fixture.nativeElement as HTMLElement;

      // THEN the record shows the three sections in order and no other section
      expect(component.isViewing).toBeTrue();
      const titles = Array.from(el.querySelectorAll('[data-section] h3')).map(
        heading => heading.textContent?.trim()
      );
      expect(titles).toEqual([
        'Personal information',
        'Current academic information',
        'Interventions',
      ]);
      expect(el.querySelectorAll('[data-section]').length).toBe(3);
      expect(el.querySelector('app-form-factory')).toBeNull();
    });

    it('[641-align-student-modal-fields/AC-13] does not show the fields outside the agreed list when viewing', async () => {
      // GIVEN a student whose profile holds data of the removed fields, and a user with an ERAS role
      // WHEN they open the student record for viewing
      const { fixture } = await createComponent({
        cohorts,
        student: profile,
        hasProfile: true,
      });
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

      // THEN none of those fields or their values is shown, only the agreed ones
      for (const hidden of [
        '2001-05-04',
        'Female',
        'Costa Rican',
        'Panama',
        'ID-777777',
        'secondary@example.com',
        'Heredia',
        'Calle 5',
        '10101',
        'Bachelor',
        'Engineering',
        'Hybrid',
        'Old School',
        'Low attendance',
      ]) {
        expect(text).withContext(hidden).not.toContain(hidden);
      }
      for (const shown of [
        'Ana Torres',
        'ana.torres@jala.university',
        'S-1001',
        '+506 8888 0000',
        'Costa Rica',
        'Cohort A',
        'Satisfactory',
        'Algorithms',
      ]) {
        expect(text).withContext(shown).toContain(shown);
      }
    });

    it('[641-align-student-modal-fields/AC-14] keeps the fields of the edit and new student forms', async () => {
      // GIVEN a user who can edit students
      // WHEN they open the record to edit an existing student
      const edit = await createComponent({
        cohorts,
        student: profile,
        hasProfile: true,
      });
      edit.component.startEditing();
      edit.fixture.detectChanges();

      // THEN the edit form still shows its current fields
      const editNames = edit.component.formFields.map(field => field.name);
      for (const name of [
        'dateOfBirth',
        'gender',
        'idPassportNumber',
        'city',
        'street',
        'levelOfStudy',
      ]) {
        expect(editNames).withContext(`edit: ${name}`).toContain(name);
      }
      expect(edit.component.title).toBe('Edit Student');
      expect(
        (edit.fixture.nativeElement as HTMLElement).querySelector(
          'app-form-factory'
        )
      ).not.toBeNull();

      // AND the new student form too
      const created = TestBed.runInInjectionContext(
        () =>
          new NewStudentModalComponent(
            dialogRef as unknown as MatDialogRef<
              NewStudentModalComponent,
              boolean
            >,
            { cohorts }
          )
      );
      const newNames = created.formFields.map(field => field.name);
      for (const name of [
        'dateOfBirth',
        'gender',
        'idPassportNumber',
        'city',
      ]) {
        expect(newNames).withContext(`new: ${name}`).toContain(name);
      }
      expect(created.title).toBe('New Student');
    });

    it('[641-align-student-modal-fields/AC-15] saves the edited value and sends the unchanged form values', async () => {
      // GIVEN an existing student with data the form does not show or send
      const { fixture, component } = await createComponent({
        cohorts,
        student: profile,
        hasProfile: true,
      });
      studentService.updateStudentProfile.and.returnValue(of(profile));
      component.startEditing();
      fixture.detectChanges();

      // WHEN the user changes only the mobile number and saves
      component.form.get('mobileNumber')?.setValue('+506 7777 1111');
      component.form.markAsDirty();
      component.submit();

      // THEN the mobile number is sent and the unchanged form values go with it
      const [id, payload] =
        studentService.updateStudentProfile.calls.mostRecent().args as [
          number,
          StudentRegistrationModel,
        ];
      expect(id).toBe(7);
      expect(payload).toEqual(
        jasmine.objectContaining({
          mobileNumber: '+506 7777 1111',
          dateOfBirth: '2001-05-04',
          city: 'Heredia',
        })
      );
      // AND the profile-view values are not echoed back, so the API keeps the stored ones
      for (const key of [
        'sisId',
        'cgpa',
        'sapStatus',
        'currentCourses',
        'identifiedRisks',
        'supportReceived',
      ]) {
        expect(Object.keys(payload)).withContext(key).not.toContain(key);
      }
    });
  });
});
