import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMPTY, of, throwError } from 'rxjs';

import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { StudentRegistrationModel } from '@core/models/student-registration.model';
import { StudentService } from '@core/services/api/student.service';
import { ERASPermissions } from '@core/services/permissions/permission.policies';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { StudentInterventionsComponent } from '../student-interventions/student-interventions.component';
import {
  EditStudentModalComponent,
  EditStudentModalData,
} from './edit-student-modal.component';

/** The Interventions list has its own spec (add control included); here it only has to be placed below the form. */
@Component({
  selector: 'app-student-interventions',
  template: '<h3>Interventions</h3>',
})
class StubStudentInterventionsComponent {
  readonly studentId = input.required<number>();
}

describe('EditStudentModalComponent', () => {
  let studentService: jasmine.SpyObj<StudentService>;
  let toastService: jasmine.SpyObj<ToastNotificationService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EditStudentModalComponent>>;
  let guard: jasmine.SpyObj<UnsavedChangesGuardService>;
  let permissions: jasmine.SpyObj<PermissionsService>;

  const profile: StudentProfileSummaryModel = {
    studentId: 7,
    isImported: false,
    firstName: 'Ana',
    lastName: 'Torres',
    idPassportNumber: 'ID-777777',
    primaryEmail: 'ana.torres@jala.university',
    mobileNumber: '+506 8888 0000',
    dateOfBirth: '2001-05-04',
    city: 'San José',
    sisId: 'S-1001',
    cgpa: 3.4,
    sapStatus: 'Satisfactory',
    currentCourses: [{ name: 'Algorithms', group: 'A', section: '2' }],
    identifiedRisks: ['Low attendance'],
  };

  async function createComponent(data: EditStudentModalData): Promise<{
    fixture: ComponentFixture<EditStudentModalComponent>;
    component: EditStudentModalComponent;
    el: HTMLElement;
  }> {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: data });
    const fixture = TestBed.createComponent(EditStudentModalComponent);
    fixture.detectChanges();
    return {
      fixture,
      component: fixture.componentInstance,
      el: fixture.nativeElement as HTMLElement,
    };
  }

  const buttonLabels = (el: HTMLElement): (string | undefined)[] =>
    Array.from(el.querySelectorAll('mat-dialog-actions button')).map(b =>
      b.textContent?.trim()
    );

  beforeEach(async () => {
    studentService = jasmine.createSpyObj('StudentService', [
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
      imports: [EditStudentModalComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: StudentService, useValue: studentService },
        { provide: ToastNotificationService, useValue: toastService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: UnsavedChangesGuardService, useValue: guard },
        { provide: PermissionsService, useValue: permissions },
        { provide: MAT_DIALOG_DATA, useValue: { student: profile } },
      ],
    })
      .overrideComponent(EditStudentModalComponent, {
        remove: { imports: [StudentInterventionsComponent] },
        add: { imports: [StubStudentInterventionsComponent] },
      })
      .compileComponents();
  });

  it('[686-edit-focused-student-profile-modal/AC-3] opens editable with the stored values, titled Edit Student Profile and without an Edit button', async () => {
    // GIVEN an ERAS Administrator and Ana Torres with a registered profile
    // WHEN they choose "Edit Student Profile"
    const { component, el } = await createComponent({ student: profile });

    // THEN the modal is titled "Edit Student Profile" with its fields enabled and the mobile number filled in
    expect(el.querySelector('h2')?.textContent?.trim()).toBe(
      'Edit Student Profile'
    );
    expect(component.form.enabled).toBeTrue();
    expect(component.form.get('mobileNumber')?.value).toBe('+506 8888 0000');
    // AND there is no Edit button, only Cancel and Save
    expect(buttonLabels(el)).toEqual(['Cancel', 'Save']);
  });

  it('[686-edit-focused-student-profile-modal/AC-4] opens editable and prefilled with name and email for a student without a profile', async () => {
    // GIVEN an imported student with only a name and an email
    const imported: StudentProfileSummaryModel = {
      studentId: 9,
      isImported: true,
      firstName: 'Luis',
      lastName: 'Anaya',
      idPassportNumber: '',
      primaryEmail: 'luis.anaya@jala.university',
    };

    // WHEN a Student Services Officer chooses "Edit Student Profile"
    const { component } = await createComponent({ student: imported });

    // THEN the name and email are filled in and the remaining fields are empty
    expect(component.form.get('firstName')?.value).toBe('Luis');
    expect(component.form.get('primaryEmail')?.value).toBe(
      'luis.anaya@jala.university'
    );
    expect(component.form.get('mobileNumber')?.value).toBe('');
    expect(component.form.get('city')?.value).toBe('');
    expect(component.form.get('mobileNumber')?.enabled).toBeTrue();
  });

  it('[686-edit-focused-student-profile-modal/AC-6] shows the interventions list with its add control below the form', async () => {
    // GIVEN an ERAS Administrator and Ana Torres (id 7)
    // WHEN they open "Edit Student Profile"
    const { fixture, el } = await createComponent({ student: profile });

    // THEN the interventions list of student 7 is placed below the form
    const interventions = fixture.debugElement.query(
      By.directive(StubStudentInterventionsComponent)
    );
    expect(interventions.componentInstance.studentId()).toBe(7);
    const form = el.querySelector('app-form-factory') as HTMLElement;
    const list = interventions.nativeElement as HTMLElement;
    expect(
      form.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('[686-edit-focused-student-profile-modal/AC-7] sends the update, closes with true and shows a success message', async () => {
    // GIVEN an ERAS Administrator editing Ana Torres
    const { component } = await createComponent({ student: profile });
    studentService.updateStudentProfile.and.returnValue(
      of({
        ...profile,
        mobileNumber: '+506 7777 1111',
      } as StudentRegistrationModel)
    );

    // WHEN they change the mobile number and press Save
    component.form.get('mobileNumber')?.setValue('+506 7777 1111');
    component.form.markAsDirty();
    component.submit();

    // THEN the update is sent, the modal closes with true and a success message is shown
    expect(studentService.updateStudentProfile).toHaveBeenCalledOnceWith(
      7,
      jasmine.objectContaining({ mobileNumber: '+506 7777 1111' })
    );
    expect(toastService.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: 'success' })
    );
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('[686-edit-focused-student-profile-modal/AC-8] discards unsaved changes after confirming and sends no request', async () => {
    // GIVEN an ERAS Administrator who changed the mobile number without saving
    const { component, el } = await createComponent({ student: profile });
    component.form.get('mobileNumber')?.setValue('+506 7777 1111');
    component.form.markAsDirty();

    // WHEN they press Cancel and confirm the discard
    (
      Array.from(el.querySelectorAll('button')).find(
        b => b.textContent?.trim() === 'Cancel'
      ) as HTMLButtonElement
    ).click();

    // THEN the guard is asked with the dirty state and no save request is sent
    expect(guard.requestClose).toHaveBeenCalled();
    const isDirty = guard.requestClose.calls.mostRecent()
      .args[1] as () => boolean;
    expect(isDirty()).toBeTrue();
    expect(studentService.updateStudentProfile).not.toHaveBeenCalled();
  });

  it('[686-edit-focused-student-profile-modal/AC-9] closes on Cancel without asking when nothing changed', async () => {
    // GIVEN an ERAS Administrator who opened the modal and changed nothing
    const { el } = await createComponent({ student: profile });

    // WHEN they press Cancel
    (
      Array.from(el.querySelectorAll('button')).find(
        b => b.textContent?.trim() === 'Cancel'
      ) as HTMLButtonElement
    ).click();

    // THEN the guard sees a clean form (so it closes without a prompt) and no save request is sent
    const isDirty = guard.requestClose.calls.mostRecent()
      .args[1] as () => boolean;
    expect(isDirty()).toBeFalse();
    expect(studentService.updateStudentProfile).not.toHaveBeenCalled();
  });

  it('[686-edit-focused-student-profile-modal/AC-14] sends the edited value with the unchanged form values', async () => {
    // GIVEN an existing student with data the form does not show or send
    const { component } = await createComponent({ student: profile });
    studentService.updateStudentProfile.and.returnValue(of(profile));

    // WHEN the user changes only the mobile number and saves
    component.form.get('mobileNumber')?.setValue('+506 7777 1111');
    component.form.markAsDirty();
    component.submit();

    // THEN the mobile number is sent and the unchanged form values go with it
    const [id, payload] = studentService.updateStudentProfile.calls.mostRecent()
      .args as [number, StudentRegistrationModel];
    expect(id).toBe(7);
    expect(payload).toEqual(
      jasmine.objectContaining({
        mobileNumber: '+506 7777 1111',
        dateOfBirth: '2001-05-04',
        city: 'San José',
      })
    );
    // AND the profile-view values are not echoed back, so the API keeps the stored ones
    for (const key of [
      'sisId',
      'cgpa',
      'sapStatus',
      'currentCourses',
      'identifiedRisks',
    ]) {
      expect(Object.keys(payload)).withContext(key).not.toContain(key);
    }
  });

  it('[686-edit-focused-student-profile-modal/AC-17] opens with disabled fields and only Close for a user who cannot manage students, keeping the interventions add control', async () => {
    // GIVEN an ERAS Professional (no student-management permission)
    permissions.can.and.callFake(
      permission => permission !== ERASPermissions.CAN_MANAGE_STUDENTS
    );

    // WHEN they choose "Edit Student Profile"
    const { fixture, component, el } = await createComponent({
      student: profile,
    });

    // THEN every profile field is disabled and only Close is offered
    expect(component.form.disabled).toBeTrue();
    expect(buttonLabels(el)).toEqual(['Close']);
    // AND the interventions list is still below the form
    expect(
      fixture.debugElement.query(
        By.directive(StubStudentInterventionsComponent)
      )
    ).not.toBeNull();
  });

  it('locks the name and email of imported students but still sends them', async () => {
    const { component } = await createComponent({
      student: { ...profile, isImported: true },
    });
    studentService.updateStudentProfile.and.returnValue(of(profile));
    component.form.get('city')?.setValue('La Paz');
    component.form.markAsDirty();

    ['firstName', 'middleName', 'lastName', 'primaryEmail'].forEach(name =>
      expect(component.form.get(name)?.disabled).withContext(name).toBeTrue()
    );
    expect(component.form.get('city')?.enabled).toBeTrue();

    component.submit();

    expect(studentService.updateStudentProfile).toHaveBeenCalledWith(
      7,
      jasmine.objectContaining({ primaryEmail: 'ana.torres@jala.university' })
    );
  });

  it('shows the server message and allows retrying on error', async () => {
    spyOn(console, 'error');
    const { component } = await createComponent({ student: profile });
    studentService.updateStudentProfile.and.returnValue(
      throwError(
        () => new HttpErrorResponse({ status: 409, error: 'Email in use.' })
      )
    );
    component.form.get('city')?.setValue('La Paz');
    component.form.markAsDirty();

    component.submit();

    expect(toastService.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({ message: 'Email in use.', type: 'error' }),
      true
    );
    expect(component.isSubmitting).toBeFalse();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
