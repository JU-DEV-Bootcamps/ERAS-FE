import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';

import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { ApiResponse } from '@core/models/api-response.model';
import { CohortModel } from '@core/models/cohort.model';
import { EventAction } from '@core/models/load';
import { StudentProfileSummaryModel } from '@core/models/student-profile-summary.model';
import { StudentModel } from '@core/models/student.model';
import { CohortService } from '@core/services/api/cohort.service';
import { StudentService } from '@core/services/api/student.service';
import { CsvCheckerService } from '@core/services/csv-checker.service';
import { ViewportService } from '@core/services/layout/viewport.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { ModalDeleteConfirmationService } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.service';
import { StudentsListComponent } from './students-list.component';

const MOBILE_WIDTH = 375;

const student = {
  id: 1,
  uuid: 'uuid-1',
  name: 'Ana Torres',
  email: 'ana.torres@jala.university',
  isImported: true,
  cohortId: 1,
  cohort: 'Cohort A',
  isSelected: false,
  audit: {},
  studentDetail: {
    studentId: 100,
    enrolledCourses: 5,
    gradedCourses: 4,
    timeDeliveryRate: 0.8,
    avgScore: 90,
    coursesUnderAvg: 1,
    pureScoreDiff: 2,
    standardScoreDiff: 0.5,
    lastAccessDays: 3,
  },
} as unknown as StudentModel;

const profile = {
  studentId: 1,
  firstName: 'Ana',
  lastName: 'Torres',
  currentCourses: [
    { name: 'Algorithms', group: 'A', section: '2' },
    { name: 'Databases', group: 'B', section: '1' },
  ],
} as unknown as StudentProfileSummaryModel;

const actionOn = (id: string): EventAction =>
  ({ item: { id: 1 }, data: { id } }) as unknown as EventAction;

describe('StudentsListComponent on mobile and desktop screens', () => {
  let fixture: ComponentFixture<StudentsListComponent>;
  let component: StudentsListComponent;
  let isMobile: WritableSignal<boolean>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let originalInnerWidth: number;

  const host = () => fixture.nativeElement as HTMLElement;
  const query = <T extends Element>(selector: string) =>
    host().querySelector(selector) as T | null;
  const dialogOf = () => (component as unknown as { dialog: MatDialog }).dialog;

  const setWindowWidth = (width: number) =>
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: width,
    });

  const create = (mobile: boolean, totalStudents = 1) => {
    isMobile.set(mobile);
    studentServiceSpy.getData.and.returnValue(
      of({ items: [student], count: totalStudents })
    );
    fixture = TestBed.createComponent(StudentsListComponent);
    component = fixture.componentInstance;
    host().style.display = 'block';
    host().style.width = mobile ? `${MOBILE_WIDTH}px` : '1280px';
    fixture.detectChanges();
  };

  const stubDialog = () =>
    spyOn(dialogOf(), 'open').and.returnValue({
      afterClosed: () => of(undefined),
    } as unknown as MatDialogRef<unknown>);

  const configOf = (spy: jasmine.Spy): MatDialogConfig =>
    spy.calls.mostRecent().args[1] as MatDialogConfig;

  const expectFullScreen = (config: MatDialogConfig) => {
    expect(config.width).toBe('100vw');
    expect(config.maxWidth).toBe('100vw');
    expect(config.height).toBe('100dvh');
    expect(config.maxHeight).toBe('100dvh');
    expect(config.panelClass).toContain('mobile-fullscreen-dialog');
  };

  beforeEach(async () => {
    isMobile = signal(false);
    originalInnerWidth = window.innerWidth;

    studentServiceSpy = jasmine.createSpyObj<StudentService>('StudentService', [
      'getData',
      'getStudentProfile',
      'getStudentProfileSummary',
      'deleteStudent',
    ]);
    studentServiceSpy.getStudentProfileSummary.and.returnValue(of(profile));

    const cohortServiceSpy = jasmine.createSpyObj<CohortService>(
      'CohortService',
      ['getCohorts']
    );
    cohortServiceSpy.getCohorts.and.returnValue(
      of({
        body: [{ id: 3, name: 'Cohort 3' }],
        success: true,
        message: '',
        validationErrors: null,
      } as unknown as ApiResponse<CohortModel[]>)
    );

    const featureFlagsSpy = jasmine.createSpyObj<FeatureFlagsService>(
      'FeatureFlagsService',
      ['isEnabled']
    );
    featureFlagsSpy.isEnabled.and.returnValue(false);

    const permissionsSpy = jasmine.createSpyObj<PermissionsService>(
      'PermissionsService',
      ['can']
    );
    permissionsSpy.can.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [StudentsListComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
            params: of({}),
            queryParams: of({}),
          },
        },
        { provide: Keycloak, useValue: {} },
        { provide: ViewportService, useValue: { isMobile } },
        { provide: StudentService, useValue: studentServiceSpy },
        { provide: CohortService, useValue: cohortServiceSpy },
        { provide: FeatureFlagsService, useValue: featureFlagsSpy },
        { provide: PermissionsService, useValue: permissionsSpy },
        {
          provide: CsvCheckerService,
          useValue: jasmine.createSpyObj('CsvCheckerService', [
            'validateCSV',
            'getErrors',
            'getCSVData',
          ]),
        },
        {
          provide: ToastNotificationService,
          useValue: jasmine.createSpyObj('ToastNotificationService', [
            'showToast',
          ]),
        },
        {
          provide: ModalDeleteConfirmationService,
          useValue: jasmine.createSpyObj('ModalDeleteConfirmationService', [
            'confirmDelete',
          ]),
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    setWindowWidth(originalInnerWidth);
    TestBed.inject(MatDialog).closeAll();
  });

  it('[659-improve-students-mobile-view/AC-7] stacks the search field above the action buttons on mobile', () => {
    // GIVEN an ERAS Administrator on a mobile screen, on the Students page with a student
    // WHEN the page is shown
    create(true);

    // THEN the search field is on its own row and as wide as the content
    const hostRect = host().getBoundingClientRect();
    const search = query<HTMLElement>('.students-search')!;
    const searchRect = search.getBoundingClientRect();
    expect(searchRect.width).toBeCloseTo(hostRect.width, 0);
    // AND the Import, Export and New Student buttons are all visible below it, with no horizontal scroll
    const buttons = Array.from(
      host().querySelectorAll<HTMLElement>('.buttons-container app-eras-button')
    );
    expect(buttons.length).toBe(3);
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      expect(rect.top).toBeGreaterThanOrEqual(searchRect.bottom - 1);
      expect(rect.left).toBeGreaterThanOrEqual(hostRect.left);
      expect(rect.right).toBeLessThanOrEqual(hostRect.right + 1);
    });
    expect(host().scrollWidth).toBeLessThanOrEqual(host().clientWidth);
  });

  it('puts Import and Export side by side with New Student on the row below on mobile', () => {
    create(true);

    const [importButton, exportButton, newStudentButton] = Array.from(
      host().querySelectorAll<HTMLElement>('.buttons-container app-eras-button')
    ).map(button => button.getBoundingClientRect());

    expect(Math.abs(importButton.top - exportButton.top)).toBeLessThan(2);
    expect(exportButton.left).toBeGreaterThan(importButton.right - 1);
    expect(newStudentButton.top).toBeGreaterThanOrEqual(
      importButton.bottom - 1
    );
  });

  it('[659-improve-students-mobile-view/AC-8] shows each student as a card with every column and the actions', () => {
    // GIVEN the student "Ana Torres" in the Students list on a mobile screen
    setWindowWidth(MOBILE_WIDTH);

    // WHEN the list is shown
    create(true);

    // THEN "Ana Torres" appears as a card with every column and the action icons
    const cards = host().querySelectorAll('mat-card');
    expect(cards.length).toBe(1);
    const card = cards[0] as HTMLElement;
    [
      'Name',
      'Email',
      'Timely Submissions',
      'Avg. Score',
      'Last Access',
    ].forEach(label => expect(card.textContent).toContain(label));
    expect(card.textContent).toContain('Ana Torres');
    expect(card.querySelectorAll('app-action-button').length).toBe(3);
    // AND neither the card nor the page scrolls horizontally
    expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    expect(host().scrollWidth).toBeLessThanOrEqual(host().clientWidth);
  });

  it('[659-improve-students-mobile-view/AC-9] reduces the pagination of the Students list on mobile', () => {
    // GIVEN the Students list with more than one page of students on a mobile screen
    // WHEN the list is shown
    create(true, 25);

    // THEN the pagination shows the range label and the previous and next buttons
    expect(query('.mat-mdc-paginator-range-label')).toBeTruthy();
    expect(query('.mat-mdc-paginator-navigation-previous')).toBeTruthy();
    expect(query('.mat-mdc-paginator-navigation-next')).toBeTruthy();
    // AND it shows neither the page-size selector nor the first and last page buttons
    expect(query('.mat-mdc-paginator-page-size')).toBeNull();
    expect(query('.mat-mdc-paginator-navigation-first')).toBeNull();
    expect(query('.mat-mdc-paginator-navigation-last')).toBeNull();
  });

  it('keeps the full pagination of the Students list on a desktop screen', () => {
    create(false, 25);

    expect(query('.mat-mdc-paginator-page-size')).toBeTruthy();
    expect(query('.mat-mdc-paginator-navigation-first')).toBeTruthy();
    expect(query('.mat-mdc-paginator-navigation-last')).toBeTruthy();
  });

  it('[659-improve-students-mobile-view/AC-10] opens the profile summary full screen on mobile', async () => {
    // GIVEN a user on a mobile screen on the Students page
    create(true);

    // WHEN they open the profile summary of a student
    component.handleActionCalled(actionOn('profileSummary'));
    fixture.detectChanges();
    await fixture.whenStable();

    // THEN the modal covers the whole screen, with no margin around it
    const modal = document.querySelector('.cdk-overlay-pane') as HTMLElement;
    const rect = modal.getBoundingClientRect();
    expect(rect.left).toBeCloseTo(0, 0);
    expect(rect.top).toBeCloseTo(0, 0);
    const screen = document.documentElement;
    expect(rect.width).toBeCloseTo(screen.clientWidth, 0);
    expect(rect.height).toBeGreaterThanOrEqual(screen.clientHeight - 1);
    // AND the Close button is visible without scrolling the page
    const close = document.querySelector('.close-button') as HTMLElement;
    const closeRect = close.getBoundingClientRect();
    expect(closeRect.top).toBeGreaterThanOrEqual(0);
    expect(closeRect.bottom).toBeLessThanOrEqual(screen.clientHeight);
  });

  it('[659-improve-students-mobile-view/AC-11] keeps the 1100px profile summary on a desktop screen', () => {
    // GIVEN a user on a desktop screen on the Students page
    create(false);
    const open = stubDialog();

    // WHEN they open the profile summary of a student
    component.handleActionCalled(actionOn('profileSummary'));

    // THEN the modal opens at 1100px, centered over the page
    const config = configOf(open);
    expect(config.width).toBe('1100px');
    expect(config.maxWidth).toBe('95vw');
    expect(config.maxHeight).toBe('95vh');
    // AND it is not the full-screen panel, so the page stays visible around it
    expect(config.height).toBeUndefined();
    expect(config.panelClass).not.toContain('mobile-fullscreen-dialog');
  });

  it('[659-improve-students-mobile-view/AC-13] opens the student details full screen on mobile', () => {
    // GIVEN a user on a mobile screen on the Students page
    create(true);
    const open = stubDialog();

    // WHEN they open the details of a student with the "See more details" action
    component.handleActionCalled(actionOn('checkDetails'));

    // THEN the modal covers the whole screen
    expectFullScreen(configOf(open));
  });

  it('[659-improve-students-mobile-view/AC-14] opens the student record full screen on mobile', () => {
    // GIVEN a user on a mobile screen on the Students page
    create(true);
    const open = stubDialog();

    // WHEN they open the profile of a student with the "View profile" action
    component.handleActionCalled(actionOn('viewProfile'));

    // THEN the modal covers the whole screen
    expectFullScreen(configOf(open));
  });

  it('[659-improve-students-mobile-view/AC-15] opens the new student form full screen on mobile', () => {
    // GIVEN an ERAS Administrator on a mobile screen on the Students page
    create(true);
    const open = stubDialog();

    // WHEN they press "New Student"
    component.openNewStudentModal();

    // THEN the form covers the whole screen
    expectFullScreen(configOf(open));
  });
});
