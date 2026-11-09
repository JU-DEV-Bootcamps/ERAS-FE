import { ApiResponse } from '@core/models/api-response.model';
import { CohortModel } from '@core/models/cohort.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { StudentInterventionModel } from '@core/models/student-intervention.model';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { StudentInterventionService } from '@core/services/api/student-intervention.service';
import { CohortService } from '@core/services/api/cohort.service';
import { StudentService } from '@core/services/api/student.service';
import { StudentProfileSummaryModalComponent } from './student-profile-summary-modal.component';

describe('StudentProfileSummaryModalComponent', () => {
  let fixture: ComponentFixture<StudentProfileSummaryModalComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let cohortServiceSpy: jasmine.SpyObj<CohortService>;
  let interventionServiceSpy: jasmine.SpyObj<StudentInterventionService>;

  const profile: StudentProfileSummaryModel = {
    firstName: 'Ana',
    lastName: 'Diaz',
    idPassportNumber: '1',
    primaryEmail: 'ana@jala.university',
    cohortId: 3,
    sisId: 'STU-1',
    cgpa: 3.5,
    isCurrentCourseThirdAttempt: true,
    passedCoursesCount: 4,
    failedCoursesCount: 1,
    currentCourses: [{ name: 'Math', group: 'A', section: '2' }],
    identifiedRisks: ['Low attendance'],
    supportReceived: ['Tutoring'],
  };

  const entry = (
    overrides: Partial<StudentInterventionModel> = {}
  ): StudentInterventionModel => ({
    id: 5,
    studentId: 7,
    kind: 'RiskIdentified',
    type: 'Academic',
    description: 'Failed two midterms',
    entryDate: '2026-10-20',
    createdBy: 'ana-sub',
    createdByName: 'Ana Pérez',
    createdAt: '2026-10-20T09:00:00Z',
    ...overrides,
  });

  const create = (
    data: StudentProfileSummaryModel | Error,
    entries: StudentInterventionModel[] = []
  ) => {
    interventionServiceSpy.getByStudent.and.returnValue(of(entries));
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
    interventionServiceSpy = jasmine.createSpyObj(
      'StudentInterventionService',
      ['getByStudent']
    );
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
        {
          provide: StudentInterventionService,
          useValue: interventionServiceSpy,
        },
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
    expect(el.querySelector('[data-field="thirdAttempt"]')).toBeTruthy();
  });

  it('hides third attempt, falls back to "-" and shows empty states', () => {
    const el = create({
      ...profile,
      isCurrentCourseThirdAttempt: false,
      sisId: null,
      identifiedRisks: [],
      supportReceived: null,
    });

    expect(el.querySelector('[data-field="thirdAttempt"]')).toBeNull();
    expect(el.textContent).toContain('-');
    expect(el.textContent).toContain('No risks identified yet.');
    expect(el.textContent).toContain('No support received yet.');
  });

  it('shows an error message when loading fails', () => {
    const el = create(new Error('boom'));

    expect(el.querySelector('.error')).toBeTruthy();
  });

  it('[641-align-student-modal-fields/AC-1] shows the three sections in order and no other', () => {
    // GIVEN a user with an ERAS role and a student with profile data
    // WHEN they open the profile summary
    const el = create(profile);

    // THEN the summary shows the three sections in order and no other section
    const titles = Array.from(el.querySelectorAll('h2, h3')).map(heading =>
      heading.textContent?.trim()
    );
    expect(titles).toEqual([
      'Personal information',
      'Current academic information',
      'Interventions',
    ]);
    expect(el.querySelectorAll('[data-section]').length).toBe(3);
  });

  it('[641-align-student-modal-fields/AC-12] does not show the fields outside the agreed list', () => {
    // GIVEN a student whose profile holds data of the removed fields
    const hidden: StudentProfileSummaryModel = {
      ...profile,
      dateOfBirth: '2001-05-04',
      gender: 'Female',
      nationality: 'Costa Rican',
      countryOfBirth: 'Panama',
      idPassportNumber: 'ID-777777',
      secondaryEmail: 'secondary@example.com',
      city: 'San José',
      street: 'Calle 5',
      postalCode: '10101',
      levelOfStudy: 'Bachelor',
      facultySchool: 'Engineering',
      studyModality: 'Hybrid',
      previousInstitution: 'Old School',
    };

    // WHEN a user with an ERAS role opens the profile summary
    const el = create(hidden);

    // THEN none of those fields or their values is shown, nor the former free-text lists
    const text = el.textContent ?? '';
    for (const hiddenText of [
      '2001-05-04',
      'Female',
      'Costa Rican',
      'Panama',
      'secondary@example.com',
      'San José',
      'Calle 5',
      '10101',
      'Bachelor',
      'Engineering',
      'Hybrid',
      'Old School',
      'Low attendance',
      'Tutoring',
    ]) {
      expect(text).not.toContain(hiddenText);
    }
    for (const label of [
      'Date of birth',
      'Gender',
      'Secondary email',
      'City',
      'Street',
      'Postal code',
      'Level of study',
      'Faculty',
      'Study modality',
      'Previous institution',
    ]) {
      expect(text.toLowerCase()).not.toContain(label.toLowerCase());
    }
  });

  it('[641-align-student-modal-fields/AC-16] requests the profile of the selected student only', () => {
    // GIVEN the Students list with Ana (id 42) and Luis (id 43), and Luis selected
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { studentId: 43 } });

    // WHEN a user opens the profile summary of Luis
    const el = create({ ...profile, firstName: 'Luis', lastName: 'Anaya' });

    // THEN only the profile of student 43 is requested, and the summary shows his data
    expect(studentServiceSpy.getStudentProfileSummary).toHaveBeenCalledOnceWith(
      43
    );
    expect(interventionServiceSpy.getByStudent).toHaveBeenCalledOnceWith(43);
    expect(el.textContent).toContain('Luis Anaya');
  });

  it('[643-add-student-interventions/AC-24] shows risks and support as separate lists without actions', () => {
    // GIVEN the student with one risk "Academic" and one support entry "Tutoring"
    // WHEN a user with an ERAS role opens the profile summary
    const el = create(profile, [
      entry(),
      entry({
        id: 6,
        kind: 'SupportReceived',
        type: 'Tutoring',
        description: 'Weekly math tutoring',
        entryDate: '2026-10-21',
      }),
    ]);

    // THEN each list shows its entry with its description and date
    const risk = el.querySelector('[data-testid="risk-entry"]');
    const support = el.querySelector('[data-testid="support-entry"]');
    expect(risk?.textContent).toContain('Academic');
    expect(risk?.textContent).toContain('Failed two midterms');
    expect(risk?.textContent).toContain('Oct 20, 2026');
    expect(support?.textContent).toContain('Tutoring');
    expect(support?.textContent).toContain('Weekly math tutoring');
    expect(el.querySelectorAll('[data-testid="risk-entry"]').length).toBe(1);
    expect(el.querySelectorAll('[data-testid="support-entry"]').length).toBe(1);
    // AND the summary has no add, edit or delete action
    expect(el.querySelector('[data-testid="edit-entry"]')).toBeNull();
    expect(el.querySelector('[data-testid="delete-entry"]')).toBeNull();
    expect(interventionServiceSpy.getByStudent).toHaveBeenCalledWith(7);
  });

  it('[643-add-student-interventions/AC-25] shows an empty-state message in each empty list', () => {
    // GIVEN a student with no risk entries and no support entries
    // WHEN a user with an ERAS role opens the profile summary
    const el = create(profile, []);

    // THEN each list shows its empty-state message and no rows
    expect(el.textContent).toContain('No risks identified yet.');
    expect(el.textContent).toContain('No support received yet.');
    expect(el.querySelectorAll('.entry').length).toBe(0);
  });

  it('[643-add-student-interventions/AC-26] displays a description as plain text', () => {
    // GIVEN an entry whose description contains markup and a script
    const description = '<b>Late</b><script>alert(1)</script>';

    // WHEN a user with an ERAS role opens the profile summary
    const el = create(profile, [entry({ description })]);

    // THEN the description is shown literally, with no markup rendered and no script
    expect(el.querySelector('.description')?.textContent).toBe(description);
    expect(el.querySelector('.description b')).toBeNull();
    expect(el.querySelector('.description script')).toBeNull();
  });

  it('[643-add-student-interventions/AC-34] does not show the former free-text lists', () => {
    // GIVEN a student whose profile has the free-text risk "Low attendance" and no entries
    // WHEN a user with an ERAS role opens the profile summary
    const el = create({ ...profile, identifiedRisks: ['Low attendance'] }, []);

    // THEN the Risks list is empty and "Low attendance" is not shown
    expect(el.textContent).toContain('No risks identified yet.');
    expect(el.textContent).not.toContain('Low attendance');
  });

  it('keeps showing the profile when the entries cannot be loaded', () => {
    interventionServiceSpy.getByStudent.and.returnValue(
      throwError(() => new Error('403'))
    );
    studentServiceSpy.getStudentProfileSummary.and.returnValue(of(profile));
    fixture = TestBed.createComponent(StudentProfileSummaryModalComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Ana Diaz');
    expect(el.textContent).toContain(
      'The interventions could not be loaded, please try again.'
    );
  });

  describe('height of the profile area', () => {
    const maxHeightOn = (panelClass: string | null): string => {
      const panel = document.createElement('div');
      if (panelClass) panel.classList.add(panelClass);
      document.body.appendChild(panel);
      const el = create(profile);
      panel.appendChild(el);
      const area = el.querySelector('.profile-modal') as HTMLElement;
      const maxHeight = getComputedStyle(area).maxHeight;
      panel.remove();
      return maxHeight;
    };

    it('lets the profile area use the full screen height in a full-screen dialog', () => {
      expect(maxHeightOn('mobile-fullscreen-dialog')).toBe('none');
    });

    it('keeps the profile area capped at 75% of the screen height on desktop', () => {
      expect(maxHeightOn(null)).toBe(`${window.innerHeight * 0.75}px`);
    });
  });
});
