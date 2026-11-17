import { provideHttpClient } from '@angular/common/http';
import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EMPTY } from 'rxjs';

import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { StudentService } from '@core/services/api/student.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { EditStudentModalComponent } from './edit-student-modal/edit-student-modal.component';
import { NewStudentModalComponent } from './new-student-modal/new-student-modal.component';
import { StudentInterventionsComponent } from './student-interventions/student-interventions.component';

/** The Interventions section has its own spec; here it only has to be placed under its heading. */
@Component({
  selector: 'app-student-interventions',
  template: '<h3>Interventions</h3>',
})
class StubStudentInterventionsComponent {
  readonly studentId = input.required<number>();
}

describe('Student edit and creation forms', () => {
  const profile: StudentProfileSummaryModel = {
    studentId: 7,
    cohortId: 3,
    firstName: 'Ana',
    lastName: 'Torres',
    idPassportNumber: 'AB-1',
    primaryEmail: 'ana.torres@jala.university',
  };

  const dialogRef = jasmine.createSpyObj('MatDialogRef', [
    'close',
    'backdropClick',
    'keydownEvents',
  ]);

  beforeEach(() => {
    dialogRef.backdropClick.and.returnValue(EMPTY);
    dialogRef.keydownEvents.and.returnValue(EMPTY);
    const permissions = jasmine.createSpyObj<PermissionsService>(
      'PermissionsService',
      ['can']
    );
    permissions.can.and.returnValue(true);

    TestBed.configureTestingModule({
      imports: [
        EditStudentModalComponent,
        NewStudentModalComponent,
        NoopAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        {
          provide: StudentService,
          useValue: jasmine.createSpyObj('StudentService', [
            'createManualStudent',
          ]),
        },
        { provide: PermissionsService, useValue: permissions },
        { provide: ToastNotificationService, useValue: {} },
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: UnsavedChangesGuardService,
          useValue: jasmine.createSpyObj('UnsavedChangesGuardService', [
            'attach',
            'requestClose',
          ]),
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { student: profile, cohorts: [] },
        },
      ],
    }).overrideComponent(EditStudentModalComponent, {
      remove: { imports: [StudentInterventionsComponent] },
      add: { imports: [StubStudentInterventionsComponent] },
    });
  });

  it('[686-edit-focused-student-profile-modal/AC-13] edit and new student forms keep their fields', () => {
    // GIVEN a user who can edit students
    // WHEN they open "Edit Student Profile" for an existing student
    const edit = TestBed.createComponent(EditStudentModalComponent);
    edit.detectChanges();

    // THEN the edit form still shows its current fields
    const editNames = edit.componentInstance.formFields.map(f => f.name);
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

    // AND the new student form too
    const created = TestBed.createComponent(NewStudentModalComponent);
    created.detectChanges();
    const newNames = created.componentInstance.formFields.map(f => f.name);
    for (const name of ['dateOfBirth', 'gender', 'idPassportNumber', 'city']) {
      expect(newNames).withContext(`new: ${name}`).toContain(name);
    }
  });
});
