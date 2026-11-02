import { provideHttpClient } from '@angular/common/http';
import { Component, input, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EMPTY, of } from 'rxjs';

import { ApiResponse } from '@core/models/api-response.model';
import { CohortModel } from '@core/models/cohort.model';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { CohortService } from '@core/services/api/cohort.service';
import { StudentInterventionService } from '@core/services/api/student-intervention.service';
import { StudentService } from '@core/services/api/student.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { UnsavedChangesGuardService } from '@core/services/unsaved-changes-guard.service';
import { NewStudentModalComponent } from './new-student-modal/new-student-modal.component';
import { StudentInterventionsComponent } from './student-interventions/student-interventions.component';
import { StudentProfileSummaryModalComponent } from './student-profile-summary-modal/student-profile-summary-modal.component';
import { StudentProfileViewComponent } from './student-profile-view/student-profile-view.component';

/** The Interventions section has its own spec; here it only has to be placed under its heading. */
@Component({
  selector: 'app-student-interventions',
  template: '<h3>Interventions</h3>',
})
class StubStudentInterventionsComponent {
  readonly studentId = input.required<number>();
}

interface RenderedSection {
  id: string | null;
  title: string | undefined;
  fields: { label: string; value: string }[];
}

describe('Student profile modals', () => {
  const profile: StudentProfileSummaryModel = {
    studentId: 7,
    cohortId: 3,
    cohortName: 'Cohort Alpha',
    isImported: true,
    firstName: 'Ana',
    middleName: 'María',
    lastName: 'Torres',
    idPassportNumber: 'AB-1',
    primaryEmail: 'ana.torres@jala.university',
    sisId: 'S-1001',
    mobileNumber: '+506 8888 0000',
    country: 'Costa Rica',
    cgpa: 3.4,
    sapStatus: 'Satisfactory',
    isCurrentCourseThirdAttempt: true,
    passedCoursesCount: 7,
    failedCoursesCount: 1,
    currentCourses: [
      { name: 'Algorithms', group: 'A', section: '2' },
      { name: 'Databases', group: 'B', section: '1' },
    ],
  };

  function render<T>(
    component: Type<T>,
    dialogData: unknown
  ): RenderedSection[] {
    TestBed.resetTestingModule();

    const studentService = jasmine.createSpyObj<StudentService>(
      'StudentService',
      ['getStudentProfileSummary']
    );
    studentService.getStudentProfileSummary.and.returnValue(of(profile));
    const cohortService = jasmine.createSpyObj<CohortService>('CohortService', [
      'getCohorts',
    ]);
    cohortService.getCohorts.and.returnValue(
      of({ body: [{ id: 3, name: 'Cohort Alpha' }] } as unknown as ApiResponse<
        CohortModel[]
      >)
    );
    const interventionService =
      jasmine.createSpyObj<StudentInterventionService>(
        'StudentInterventionService',
        ['getByStudent']
      );
    interventionService.getByStudent.and.returnValue(of([]));
    const permissions = jasmine.createSpyObj<PermissionsService>(
      'PermissionsService',
      ['can']
    );
    permissions.can.and.returnValue(true);
    const dialogRef = jasmine.createSpyObj('MatDialogRef', [
      'close',
      'backdropClick',
      'keydownEvents',
    ]);
    dialogRef.backdropClick.and.returnValue(EMPTY);
    dialogRef.keydownEvents.and.returnValue(EMPTY);
    const guard = jasmine.createSpyObj('UnsavedChangesGuardService', [
      'attach',
      'requestClose',
    ]);

    TestBed.configureTestingModule({
      imports: [component, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: StudentService, useValue: studentService },
        { provide: CohortService, useValue: cohortService },
        { provide: StudentInterventionService, useValue: interventionService },
        { provide: PermissionsService, useValue: permissions },
        { provide: ToastNotificationService, useValue: {} },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: UnsavedChangesGuardService, useValue: guard },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    })
      .overrideComponent(NewStudentModalComponent, {
        remove: { imports: [StudentInterventionsComponent] },
        add: { imports: [StubStudentInterventionsComponent] },
      })
      .overrideComponent(StudentProfileViewComponent, {
        remove: { imports: [StudentInterventionsComponent] },
        add: { imports: [StubStudentInterventionsComponent] },
      });

    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    return Array.from(el.querySelectorAll('[data-section]')).map(section => ({
      id: section.getAttribute('data-section'),
      title: section.querySelector('h3')?.textContent?.trim(),
      fields: Array.from(section.querySelectorAll('[data-field]')).map(
        field => ({
          label: field.querySelector('dt')?.textContent?.trim() ?? '',
          value:
            field
              .querySelector('dd')
              ?.textContent?.replace(/\s+/g, ' ')
              .trim() ?? '',
        })
      ),
    }));
  }

  it('[641-align-student-modal-fields/AC-18] both modals show the same labels, values and order for the same student', () => {
    // GIVEN the student Ana Torres with profile data
    // WHEN the profile summary and the student record (in view mode) are each opened for her
    const summary = render(StudentProfileSummaryModalComponent, {
      studentId: 7,
    });
    const record = render(NewStudentModalComponent, {
      cohorts: [],
      student: profile,
      hasProfile: true,
    });

    // THEN both show the same section titles, field labels and values, in the same order
    expect(summary.map(section => section.title)).toEqual([
      'Personal information',
      'Current academic information',
      'Interventions',
    ]);
    expect(record).toEqual(summary);
    expect(summary[0].fields.map(field => field.label)).toEqual([
      'First names',
      'Institutional email',
      'SIS ID',
      'Mobile number',
      'Country',
      'Cohort',
    ]);
  });
});
