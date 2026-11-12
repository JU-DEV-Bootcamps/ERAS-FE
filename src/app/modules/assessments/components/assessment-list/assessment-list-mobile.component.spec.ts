import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import {
  AssessmentModel,
  AssessmentStatus,
} from '@core/models/assessment.model';
import { AssessmentService } from '@core/services/api/assessement.service';
import { UsersService } from '@core/services/api/users.service';
import { ViewportService } from '@core/services/layout/viewport.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { RoleBasedFetchResolver } from '@core/utils/strategies/role-based-fetch-strategy/role-based-fetch.resolver';
import { ModalDeleteConfirmationService } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.service';

import { AssessmentListComponent } from './assessment-list.component';

const MOBILE_WIDTH = 375;
const DESKTOP_WIDTH = 1280;

describe('AssessmentListComponent on mobile and desktop screens', () => {
  let fixture: ComponentFixture<AssessmentListComponent>;
  let isMobile: WritableSignal<boolean>;
  let permissions: jasmine.SpyObj<PermissionsService>;
  let fetchResolver: jasmine.SpyObj<RoleBasedFetchResolver>;

  const assessment = (
    overrides: Partial<AssessmentModel> = {}
  ): AssessmentModel => ({
    id: 1,
    createdAtUtc: '2026-03-30T12:00:00Z',
    createdBy: 'officer-sub',
    service: 'student services',
    assignedProfessionals: ['professional-sub'],
    studentIds: ['12'],
    students: [
      { id: 12, name: 'Ana Torres', email: 'ana@mail.com', avgRiskLevel: 0 },
    ],
    comments: 'Follow up after the midterms',
    status: AssessmentStatus.Remitted,
    interventions: [],
    ...overrides,
  });

  const host = () => fixture.nativeElement as HTMLElement;
  const all = <T extends Element>(selector: string) =>
    Array.from(host().querySelectorAll<T>(selector));
  const one = <T extends Element>(selector: string) =>
    host().querySelector<T>(selector);
  const cardButton = (label: string) =>
    one<HTMLButtonElement>(`.assessment-card button[aria-label="${label}"]`);
  const fitsInside = (element: Element) =>
    element.scrollWidth <= element.clientWidth;
  /** The rectangle of an element fixed to the four edges of the screen. */
  const wholeScreen = () => {
    const probe = document.createElement('div');
    probe.style.cssText = 'position: fixed; inset: 0;';
    document.body.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    probe.remove();
    return rect;
  };

  const create = (mobile: boolean, items = [assessment()]) => {
    isMobile.set(mobile);
    fetchResolver.resolve.and.returnValue(of(items));
    fixture = TestBed.createComponent(AssessmentListComponent);
    fixture.componentRef.setInput('lookupsLoading', false);
    host().style.display = 'block';
    host().style.width = `${mobile ? MOBILE_WIDTH : DESKTOP_WIDTH}px`;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    isMobile = signal(false);

    permissions = jasmine.createSpyObj<PermissionsService>(
      'PermissionsService',
      ['can']
    );
    permissions.can.and.returnValue(true);

    fetchResolver = jasmine.createSpyObj<RoleBasedFetchResolver>(
      'RoleBasedFetchResolver',
      ['resolve']
    );

    const assessmentService = jasmine.createSpyObj<AssessmentService>(
      'AssessmentService',
      ['deleteAssessment', 'clearCache', 'getActivity']
    );
    assessmentService.getActivity.and.returnValue(of([]));

    const usersService = jasmine.createSpyObj<UsersService>('UsersService', [
      'getByRole',
    ]);
    usersService.getByRole.and.returnValue(
      of([
        {
          sub: 'professional-sub',
          firstName: 'Luis',
          lastName: 'Gómez',
          email: 'luis@mail.com',
        },
        {
          sub: 'officer-sub',
          firstName: 'Marta',
          lastName: 'Ruiz',
          email: 'marta@mail.com',
        },
      ]) as never
    );

    const modalDelete = jasmine.createSpyObj<ModalDeleteConfirmationService>(
      'ModalDeleteConfirmationService',
      ['confirmDelete']
    );
    modalDelete.confirmDelete.and.returnValue({
      afterClosed: () => of(false),
    } as never);

    await TestBed.configureTestingModule({
      imports: [AssessmentListComponent],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ViewportService, useValue: { isMobile } },
        { provide: PermissionsService, useValue: permissions },
        { provide: RoleBasedFetchResolver, useValue: fetchResolver },
        { provide: AssessmentService, useValue: assessmentService },
        { provide: UsersService, useValue: usersService },
        { provide: ModalDeleteConfirmationService, useValue: modalDelete },
        {
          provide: ToastNotificationService,
          useValue: jasmine.createSpyObj('ToastNotificationService', [
            'showToast',
          ]),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj('FeatureFlagsService', ['isEnabled']),
        },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('MatDialog', ['open']),
        },
      ],
    }).compileComponents();
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-1] shows each assessment as a card with every field and no horizontal scroll on mobile', () => {
    // GIVEN an assessment of "Ana Torres" with the professional "Luis Gómez" and the status "Remitted"
    // WHEN the Assessments tab is shown on a 375px wide screen
    create(true);

    // THEN it is a card with every field, and no table is shown
    const cards = all<HTMLElement>('.assessment-card');
    expect(cards.length).toBe(1);
    expect(one('table')).toBeNull();
    const text = cards[0].textContent ?? '';
    [
      'Date',
      '03/30/2026',
      'Submitter',
      'Marta Ruiz',
      'Service',
      'Student Services',
      'Professional',
      'Luis Gómez',
      'Student',
      'Ana Torres',
      'Status',
      'Remitted',
      'Comment',
      'Follow up after the midterms',
    ].forEach(expected => expect(text).toContain(expected));

    // AND the card, the pagination and the page have no horizontal scroll
    const paginator = one<HTMLElement>('mat-paginator')!;
    expect(fitsInside(cards[0])).toBeTrue();
    expect(fitsInside(paginator)).toBeTrue();
    expect(fitsInside(host())).toBeTrue();
    expect(cards[0].getBoundingClientRect().width).toBeLessThanOrEqual(
      MOBILE_WIDTH
    );
    expect(paginator.getBoundingClientRect().width).toBeLessThanOrEqual(
      MOBILE_WIDTH
    );
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-4] opens the assessment detail over the whole screen and closes back to the list on mobile', () => {
    // GIVEN the assessment of "Ana Torres" on a 375px wide screen
    create(true);

    // WHEN the user uses the View action
    cardButton('View')!.click();
    fixture.detectChanges();

    // THEN the detail covers the whole screen, with its close button inside it
    const panel = one<HTMLElement>('.slide-panel-area')!;
    const panelRect = panel.getBoundingClientRect();
    const screenRect = wholeScreen();
    expect(one('app-assessment-detail-dialog')).not.toBeNull();
    expect(panelRect.left).toBe(0);
    expect(panelRect.top).toBe(0);
    expect(panelRect.width).toBe(screenRect.width);
    expect(panelRect.height).toBe(screenRect.height);

    const close = one<HTMLButtonElement>(
      'app-assessment-detail-dialog button[aria-label="Close"]'
    )!;
    const closeRect = close.getBoundingClientRect();
    expect(closeRect.width).toBeGreaterThan(0);
    expect(closeRect.top).toBeGreaterThanOrEqual(0);
    expect(closeRect.bottom).toBeLessThanOrEqual(screenRect.bottom);
    expect(closeRect.left).toBeGreaterThanOrEqual(0);
    expect(closeRect.right).toBeLessThanOrEqual(panelRect.right);
    expect(
      getComputedStyle(one<HTMLElement>('.main-content-area')!).display
    ).toBe('none');

    // AND pressing the close button shows the list again
    close.click();
    fixture.detectChanges();
    expect(one('app-assessment-detail-dialog')).toBeNull();
    expect(
      getComputedStyle(one<HTMLElement>('.main-content-area')!).display
    ).not.toBe('none');
    expect(all('.assessment-card').length).toBe(1);
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-6] shows View, Edit and Delete as icon buttons on the assessment card', () => {
    // GIVEN a user who can manage assessments and a Remitted assessment on a 375px wide screen
    create(true);
    const component = fixture.componentInstance;
    const viewed = jasmine.createSpy('viewClicked');
    const edited = jasmine.createSpy('editClicked');
    component.viewClicked.subscribe(viewed);
    component.editClicked.subscribe(edited);
    const confirmDelete = TestBed.inject(ModalDeleteConfirmationService)
      .confirmDelete as jasmine.Spy;

    // WHEN the card is shown
    const view = cardButton('View')!;
    const edit = cardButton('Edit')!;
    const remove = cardButton('Delete')!;

    // THEN the three actions are enabled icon buttons, with no menu
    [view, edit, remove].forEach(button => {
      expect(button).not.toBeNull();
      expect(button.querySelector('mat-icon')).not.toBeNull();
      expect(button.disabled).toBeFalse();
    });
    expect(one('.assessment-card .menu-action')).toBeNull();
    expect(one('.assessment-card [aria-haspopup="menu"]')).toBeNull();

    // AND each one starts with one tap
    edit.click();
    expect(edited).toHaveBeenCalledTimes(1);
    remove.click();
    expect(confirmDelete).toHaveBeenCalledTimes(1);
    view.click();
    expect(viewed).toHaveBeenCalledTimes(1);
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-15] disables Create Assessment, Edit and Delete and keeps View for a user who cannot manage assessments', () => {
    // GIVEN a user who cannot manage assessments (ERAS Professional) and a Remitted assessment
    permissions.can.and.returnValue(false);

    // WHEN they open the Assessments tab on a 375px wide screen
    create(true);

    // THEN Create Assessment, Edit and Delete are shown disabled
    const create$ = one<HTMLButtonElement>('.page-header button')!;
    expect(create$.textContent).toContain('Create Assessment');
    expect(create$.disabled).toBeTrue();
    expect(cardButton('Edit')!.disabled).toBeTrue();
    expect(cardButton('Delete')!.disabled).toBeTrue();

    // AND View is available
    expect(cardButton('View')!.disabled).toBeFalse();
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-17] keeps the assessments table, the more menu and the 480px side panel on a 1280px screen', () => {
    // GIVEN a user who can manage assessments on a 1280px wide screen
    create(false);

    // THEN the assessments are a table with a "more" menu per row, and no card
    expect(one('table.assessments-table')).not.toBeNull();
    expect(all('.assessment-card').length).toBe(0);
    expect(all('tr[mat-row]').length).toBe(1);
    const menuTrigger = one<HTMLButtonElement>(
      'tr[mat-row] .menu-action button'
    )!;
    expect(menuTrigger).not.toBeNull();
    expect(one('tr[mat-row] .inline-actions')).not.toBeNull();
    const paginator = one<HTMLElement>('mat-paginator')!;
    expect(
      paginator.querySelector('button[aria-label="First page"]')
    ).not.toBeNull();
    expect(paginator.textContent).toContain('Items per page');

    // WHEN they use the View action of the assessment
    one<HTMLButtonElement>(
      'tr[mat-row] .inline-actions button[mattooltip="View"]'
    )!.click();
    fixture.detectChanges();

    // THEN the detail is a 480px panel beside the table, which stays visible
    const panel = one<HTMLElement>('.slide-panel-area')!;
    const table = one<HTMLElement>('.main-content-area')!;
    expect(one('app-assessment-detail-dialog')).not.toBeNull();
    expect(getComputedStyle(panel).width).toBe('480px');
    expect(getComputedStyle(table).display).not.toBe('none');
    expect(table.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(panel.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      table.getBoundingClientRect().right
    );
  });
  it('keeps the cards and the pagination inside a 320px phone', () => {
    create(true);
    host().style.width = '320px';
    fixture.detectChanges();

    const card = one<HTMLElement>('.assessment-card')!;
    const paginator = one<HTMLElement>('mat-paginator')!;
    expect(fitsInside(card)).toBeTrue();
    expect(fitsInside(paginator)).toBeTrue();
    expect(fitsInside(host())).toBeTrue();
    expect(card.getBoundingClientRect().width).toBeLessThanOrEqual(320);
    expect(paginator.getBoundingClientRect().width).toBeLessThanOrEqual(320);
  });
});
