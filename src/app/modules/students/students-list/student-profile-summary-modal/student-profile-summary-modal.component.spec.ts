import { ApiResponse } from '@core/models/api-response.model';
import { CohortModel } from '@core/models/cohort.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { CohortService } from '@core/services/api/cohort.service';
import { StudentService } from '@core/services/api/student.service';
import { StudentProfileSummaryModalComponent } from './student-profile-summary-modal.component';

describe('StudentProfileSummaryModalComponent', () => {
  let fixture: ComponentFixture<StudentProfileSummaryModalComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let cohortServiceSpy: jasmine.SpyObj<CohortService>;

  const profile: StudentProfileSummaryModel = {
    firstName: 'Ana',
    lastName: 'Diaz',
    idPassportNumber: '1',
    primaryEmail: 'ana@jala.university',
    cohortId: 3,
    sisId: 'STU-1',
    cgpa: 3.5,
    isCurrentCourseThirdAttempt: true,
    passedCourses: 4,
    failedCourses: 1,
    currentCourses: [{ name: 'Math', group: 'A', section: '2' }],
    identifiedRisks: ['Low attendance'],
    supportReceived: ['Tutoring'],
  };

  const create = (data: StudentProfileSummaryModel | Error) => {
    studentServiceSpy.getStudentProfileSummary.and.returnValue(
      data instanceof Error ? throwError(() => data) : of(data)
    );
    fixture = TestBed.createComponent(StudentProfileSummaryModalComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    studentServiceSpy = jasmine.createSpyObj('StudentService', [
      'getStudentProfileSummary',
    ]);
    cohortServiceSpy = jasmine.createSpyObj('CohortService', ['getCohorts']);
    cohortServiceSpy.getCohorts.and.returnValue(
      of({ body: [{ id: 3, name: 'Cohort Alpha' }] } as unknown as ApiResponse<
        CohortModel[]
      >)
    );
    TestBed.configureTestingModule({
      imports: [StudentProfileSummaryModalComponent, NoopAnimationsModule],
      providers: [
        { provide: StudentService, useValue: studentServiceSpy },
        { provide: CohortService, useValue: cohortServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: { studentId: 7 } },
      ],
    });
  });

  it('loads the profile on open and shows the three sections', () => {
    const el = create(profile);

    expect(studentServiceSpy.getStudentProfileSummary).toHaveBeenCalledWith(7);
    expect(el.textContent).toContain('Ana Diaz');
    expect(el.textContent).toContain('STU-1');
    expect(el.textContent).toContain('Cohort Alpha');
    expect(el.textContent).toContain('Math');
    expect(el.textContent).toContain('Low attendance');
    expect(el.textContent).toContain('Tutoring');
    expect(el.querySelector('.third-attempt')).toBeTruthy();
  });

  it('hides third attempt, falls back to "-" and shows empty states', () => {
    const el = create({
      ...profile,
      isCurrentCourseThirdAttempt: false,
      sisId: null,
      identifiedRisks: [],
      supportReceived: null,
    });

    expect(el.querySelector('.third-attempt')).toBeNull();
    expect(el.textContent).toContain('-');
    expect(el.textContent).toContain('No risks identified.');
    expect(el.textContent).toContain('No support received.');
  });

  it('shows an error message when loading fails', () => {
    const el = create(new Error('boom'));

    expect(el.querySelector('.error')).toBeTruthy();
  });
});
