import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { StudentInterventionModel } from '@core/models/student-intervention.model';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { StudentInterventionService } from '@core/services/api/student-intervention.service';
import { StudentProfileViewComponent } from './student-profile-view.component';

describe('StudentProfileViewComponent', () => {
  let fixture: ComponentFixture<StudentProfileViewComponent>;
  let interventionServiceSpy: jasmine.SpyObj<StudentInterventionService>;

  const profile: StudentProfileSummaryModel = {
    studentId: 42,
    firstName: 'Ana',
    lastName: 'Torres',
    idPassportNumber: 'AB-1',
    primaryEmail: 'ana.torres@jala.university',
    sisId: 'S-1001',
    mobileNumber: '+506 8888 0000',
    country: 'Costa Rica',
    cohortName: 'Cohort 12',
    cgpa: 3.4,
    sapStatus: 'Satisfactory',
    isCurrentCourseThirdAttempt: false,
    passedCoursesCount: 7,
    failedCoursesCount: 1,
    currentCourses: [
      { name: 'Algorithms', group: 'A', section: '2' },
      { name: 'Databases', group: 'B', section: '1' },
    ],
  };

  const entry = (
    overrides: Partial<StudentInterventionModel> = {}
  ): StudentInterventionModel => ({
    id: 5,
    studentId: 42,
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
    data: StudentProfileSummaryModel,
    entries: StudentInterventionModel[] = []
  ): HTMLElement => {
    interventionServiceSpy.getByStudent.and.returnValue(of(entries));
    fixture = TestBed.createComponent(StudentProfileViewComponent);
    fixture.componentRef.setInput('profile', data);
    fixture.componentRef.setInput('studentId', 42);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  const section = (el: HTMLElement, id: string): HTMLElement =>
    el.querySelector(`[data-section="${id}"]`) as HTMLElement;

  const labels = (el: HTMLElement, id: string): string[] =>
    Array.from(section(el, id).querySelectorAll('dt')).map(
      dt => dt.textContent?.trim() ?? ''
    );

  const value = (el: HTMLElement, field: string): string =>
    el
      .querySelector(`[data-field="${field}"] dd`)
      ?.textContent?.replace(/\s+/g, ' ')
      .trim() ?? '';

  beforeEach(() => {
    interventionServiceSpy = jasmine.createSpyObj(
      'StudentInterventionService',
      ['getByStudent']
    );
    TestBed.configureTestingModule({
      imports: [StudentProfileViewComponent, NoopAnimationsModule],
      providers: [
        {
          provide: StudentInterventionService,
          useValue: interventionServiceSpy,
        },
      ],
    });
  });

  it('[641-align-student-modal-fields/AC-3] lists the personal fields in order with the full name as first names', () => {
    // GIVEN the student Ana Torres with the personal data of the scenario
    // WHEN a user with an ERAS role opens the view
    const el = create({ ...profile, middleName: null });

    // THEN Personal information lists the six fields in the agreed order, with those values
    expect(labels(el, 'personal')).toEqual([
      'First names',
      'Institutional email',
      'SIS ID',
      'Mobile number',
      'Country',
      'Cohort',
    ]);
    expect(value(el, 'firstNames')).toBe('Ana Torres');
    expect(value(el, 'institutionalEmail')).toBe('ana.torres@jala.university');
    expect(value(el, 'sisId')).toBe('S-1001');
    expect(value(el, 'mobileNumber')).toBe('+506 8888 0000');
    expect(value(el, 'country')).toBe('Costa Rica');
    expect(value(el, 'cohort')).toBe('Cohort 12');
    // AND the full name joins first, middle and last name when each exists
    const withMiddle = create({ ...profile, middleName: 'María' });
    expect(value(withMiddle, 'firstNames')).toBe('Ana María Torres');
  });

  it('[641-align-student-modal-fields/AC-4] shows a dash for a missing personal value', () => {
    // GIVEN a student with no mobile number and no country
    // WHEN a user with an ERAS role opens the view
    const el = create({ ...profile, mobileNumber: null, country: undefined });

    // THEN both fields show "-" and stay listed in their position
    expect(value(el, 'mobileNumber')).toBe('-');
    expect(value(el, 'country')).toBe('-');
    expect(labels(el, 'personal').indexOf('Mobile number')).toBe(3);
    expect(labels(el, 'personal').indexOf('Country')).toBe(4);
  });

  it('[641-align-student-modal-fields/AC-5] shows SIS ID and never STU ID', () => {
    // GIVEN the student whose SIS ID is "S-1001"
    // WHEN a user with an ERAS role opens the view
    const el = create(profile);

    // THEN the SIS ID label shows that value and the text "STU ID" does not appear
    expect(value(el, 'sisId')).toBe('S-1001');
    expect(el.textContent).not.toContain('STU ID');
  });

  it('[641-align-student-modal-fields/AC-7] lists the academic fields in order', () => {
    // GIVEN a student with CGPA 3.4, SAP status, 7 passed and 1 failed courses
    // WHEN a user with an ERAS role opens the view
    const el = create(profile);

    // THEN the section lists the fields in the agreed order and no other
    expect(labels(el, 'academic')).toEqual([
      'Current CGPA',
      'SAP status',
      'Current courses',
      'Passed courses',
      'Failed courses',
    ]);
    expect(value(el, 'cgpa')).toBe('3.4');
    expect(value(el, 'sapStatus')).toBe('Satisfactory');
    expect(value(el, 'passedCourses')).toBe('7');
    expect(value(el, 'failedCourses')).toBe('1');
  });

  it('[641-align-student-modal-fields/AC-8] shows the third-attempt field when it applies', () => {
    // GIVEN a student whose current course is a third attempt
    // WHEN a user with an ERAS role opens the view
    const el = create({ ...profile, isCurrentCourseThirdAttempt: true });

    // THEN "Third attempt" is shown between "SAP status" and the courses, saying it applies
    expect(labels(el, 'academic')).toEqual([
      'Current CGPA',
      'SAP status',
      'Third attempt',
      'Current courses',
      'Passed courses',
      'Failed courses',
    ]);
    expect(value(el, 'thirdAttempt')).toBe('Yes');
  });

  it('[641-align-student-modal-fields/AC-9] hides the third-attempt field when it does not apply or is unknown', () => {
    // GIVEN a student whose current course is not a third attempt, and another whose status is unknown
    // WHEN a user with an ERAS role opens the view of each
    const notThird = create({ ...profile, isCurrentCourseThirdAttempt: false });
    const unknown = create({ ...profile, isCurrentCourseThirdAttempt: null });

    // THEN the field is not shown and the other fields keep their order with no gap
    for (const el of [notThird, unknown]) {
      expect(el.querySelector('[data-field="thirdAttempt"]')).toBeNull();
      expect(labels(el, 'academic')).toEqual([
        'Current CGPA',
        'SAP status',
        'Current courses',
        'Passed courses',
        'Failed courses',
      ]);
    }
  });

  it('[641-align-student-modal-fields/AC-10] lists each current course with group and section', () => {
    // GIVEN a student with the courses Algorithms (A, 2) and Databases (B, 1)
    // WHEN a user with an ERAS role opens the view
    const el = create(profile);

    // THEN each course is a row with its name, group and section
    const rows = Array.from(el.querySelectorAll('.courses tbody tr')).map(row =>
      Array.from(row.querySelectorAll('td')).map(
        cell => cell.textContent?.trim() ?? ''
      )
    );
    expect(rows).toEqual([
      ['Algorithms', 'A', '2'],
      ['Databases', 'B', '1'],
    ]);
    // AND the courses sit after "SAP status" and before "Passed courses"
    const academic = labels(el, 'academic');
    expect(academic.indexOf('Current courses')).toBe(
      academic.indexOf('SAP status') + 1
    );
    expect(academic.indexOf('Passed courses')).toBe(
      academic.indexOf('Current courses') + 1
    );
  });

  it('[641-align-student-modal-fields/AC-11] shows risks and support as two lists with empty-state messages', () => {
    // GIVEN Ana with one risk "Academic" and one support entry "Tutoring", and a student with no entries
    const withEntries = create(profile, [
      entry(),
      entry({
        id: 6,
        kind: 'SupportReceived',
        type: 'Tutoring',
        description: 'Weekly math tutoring',
      }),
    ]);
    const interventions = section(withEntries, 'interventions');

    // THEN the Interventions section lists the risk and the support entry separately
    expect(interventions.querySelector('h3')?.textContent).toContain(
      'Interventions'
    );
    expect(
      interventions.querySelector('[data-testid="risk-entry"]')?.textContent
    ).toContain('Academic');
    expect(
      interventions.querySelector('[data-testid="support-entry"]')?.textContent
    ).toContain('Tutoring');
    expect(interventionServiceSpy.getByStudent).toHaveBeenCalledWith(42);

    // AND a student with no entries gets each list's empty-state message
    const empty = create(profile, []);
    expect(section(empty, 'interventions').textContent).toContain(
      'No risks identified yet.'
    );
    expect(section(empty, 'interventions').textContent).toContain(
      'No support received yet.'
    );
  });
});
