import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { StudentService } from '@core/services/api/student.service';
import { StudentProfileSummaryModalComponent } from './student-profile-summary-modal.component';

describe('StudentProfileSummaryModalComponent', () => {
  let fixture: ComponentFixture<StudentProfileSummaryModalComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;

  const profile: StudentProfileSummaryModel = {
    firstName: 'Ana',
    lastName: 'Diaz',
    idPassportNumber: '1',
    primaryEmail: 'ana@jala.university',
    stuId: 'STU-1',
    cgpa: 3.5,
    isThirdAttempt: true,
    passedCourses: 4,
    failedCourses: 1,
    currentCourses: [{ name: 'Math', group: 'A', section: '2' }],
    risks: ['Low attendance'],
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
    TestBed.configureTestingModule({
      imports: [StudentProfileSummaryModalComponent, NoopAnimationsModule],
      providers: [
        { provide: StudentService, useValue: studentServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: { studentId: 7 } },
      ],
    });
  });

  it('loads the profile on open and shows the three sections', () => {
    const el = create(profile);

    expect(studentServiceSpy.getStudentProfileSummary).toHaveBeenCalledWith(7);
    expect(el.textContent).toContain('Ana Diaz');
    expect(el.textContent).toContain('STU-1');
    expect(el.textContent).toContain('Math');
    expect(el.textContent).toContain('Low attendance');
    expect(el.textContent).toContain('Tutoring');
    expect(el.querySelector('.third-attempt')).toBeTruthy();
  });

  it('hides third attempt, falls back to "Not available" and shows empty states', () => {
    const el = create({
      ...profile,
      isThirdAttempt: false,
      stuId: null,
      risks: [],
      supportReceived: null,
    });

    expect(el.querySelector('.third-attempt')).toBeNull();
    expect(el.textContent).toContain('Not available');
    expect(el.textContent).toContain('No risks identified.');
    expect(el.textContent).toContain('No support received.');
  });

  it('shows an error message when loading fails', () => {
    const el = create(new Error('boom'));

    expect(el.querySelector('.error')).toBeTruthy();
  });
});
