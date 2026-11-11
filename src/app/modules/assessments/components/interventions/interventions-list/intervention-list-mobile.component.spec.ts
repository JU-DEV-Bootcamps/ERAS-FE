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
  InterventionMode,
  InterventionModel,
  InterventionStatus,
  InterventionType,
  RiskLevels,
} from '@core/models/assessment.model';
import { AssessmentService } from '@core/services/api/assessement.service';
import { AttachmentApiService } from '@core/services/api/attachments.service';
import { InterventionService } from '@core/services/api/intervention.service';
import { UsersService } from '@core/services/api/users.service';
import { CsvService } from '@core/services/exports/csv.service';
import { ViewportService } from '@core/services/layout/viewport.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { RoleBasedFetchResolver } from '@core/utils/strategies/role-based-fetch-strategy/role-based-fetch.resolver';
import { InterventionFilterStrategy } from '@shared/components/list-filters/strategies/interventions.strategy';
import { ModalDeleteConfirmationService } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.service';

import { AssessmentListComponent } from '../../assessment-list/assessment-list.component';
import { InterventionListComponent } from './intervention-list.component';

const MOBILE_WIDTH = 375;
const DESKTOP_WIDTH = 1280;

describe('InterventionListComponent on mobile and desktop screens', () => {
  let fixture: ComponentFixture<InterventionListComponent>;
  let isMobile: WritableSignal<boolean>;
  let assessmentService: jasmine.SpyObj<AssessmentService>;
  let fetchResolver: jasmine.SpyObj<RoleBasedFetchResolver>;

  const workshop: InterventionModel = {
    id: 5,
    assessmentId: 10,
    kind: InterventionType.Individual,
    mode: InterventionMode.InPlace,
    status: InterventionStatus.InProgress,
    professional: 'professional-sub',
    dateUtc: '2026-02-20T12:00:00Z',
    activity: 'workshop',
    comments: 'First session done',
    area: 'academic',
    studentIds: [12],
    riskLevelName: RiskLevels.High,
    endRiskLevelName: RiskLevels.Low,
  };

  const assessment = (status: AssessmentStatus): AssessmentModel =>
    ({
      id: 10,
      createdAtUtc: '2026-03-30T12:00:00Z',
      createdBy: 'officer-sub',
      service: 'student services',
      assignedProfessionals: ['professional-sub'],
      studentIds: ['12'],
      students: [
        { id: 12, name: 'Ana Torres', email: 'ana@mail.com', avgRiskLevel: 0 },
      ],
      comments: '',
      status,
      interventions: [],
    }) as AssessmentModel;

  const host = () => fixture.nativeElement as HTMLElement;
  const all = <T extends Element>(selector: string) =>
    Array.from(host().querySelectorAll<T>(selector));
  const one = <T extends Element>(selector: string) =>
    host().querySelector<T>(selector);
  const cardButton = (label: string, root: HTMLElement = host()) =>
    root.querySelector<HTMLButtonElement>(
      `mat-card button[aria-label="${label}"]`
    );
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

  const create = (
    mobile: boolean,
    status: AssessmentStatus = AssessmentStatus.Remitted
  ) => {
    isMobile.set(mobile);
    assessmentService.getById.and.returnValue(of(assessment(status)));
    fetchResolver.resolve.and.returnValue(of([workshop]));
    fixture = TestBed.createComponent(InterventionListComponent);
    fixture.componentRef.setInput('studentNamesLookup', {
      12: { id: 12, name: 'Ana Torres', email: 'ana@mail.com' },
    });
    fixture.componentRef.setInput('professionalDisplayLookup', {
      'professional-sub': 'Luis Gómez',
    });
    fixture.componentRef.setInput('assessmentIdInput', 10);
    host().style.display = 'block';
    host().style.width = `${mobile ? MOBILE_WIDTH : DESKTOP_WIDTH}px`;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    isMobile = signal(false);

    assessmentService = jasmine.createSpyObj<AssessmentService>(
      'AssessmentService',
      ['getById', 'getActivity', 'deleteAssessment', 'clearCache']
    );
    assessmentService.getActivity.and.returnValue(of([]));

    fetchResolver = jasmine.createSpyObj<RoleBasedFetchResolver>(
      'RoleBasedFetchResolver',
      ['resolve']
    );

    const interventionService = jasmine.createSpyObj<InterventionService>(
      'InterventionService',
      ['getByAssessment', 'getActivity']
    );
    interventionService.getActivity.and.returnValue(of([]));

    const attachments = jasmine.createSpyObj<AttachmentApiService>(
      'AttachmentApiService',
      ['list']
    );
    attachments.list.and.returnValue(of([]));

    const filterStrategy = jasmine.createSpyObj<InterventionFilterStrategy>(
      'InterventionFilterStrategy',
      ['apply']
    );
    filterStrategy.apply.and.callFake(items => items);

    const permissions = jasmine.createSpyObj<PermissionsService>(
      'PermissionsService',
      ['can']
    );
    permissions.can.and.returnValue(true);

    const usersService = jasmine.createSpyObj<UsersService>('UsersService', [
      'getByRole',
    ]);
    usersService.getByRole.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [InterventionListComponent, AssessmentListComponent],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ViewportService, useValue: { isMobile } },
        { provide: AssessmentService, useValue: assessmentService },
        { provide: InterventionService, useValue: interventionService },
        { provide: AttachmentApiService, useValue: attachments },
        { provide: InterventionFilterStrategy, useValue: filterStrategy },
        { provide: RoleBasedFetchResolver, useValue: fetchResolver },
        { provide: PermissionsService, useValue: permissions },
        { provide: UsersService, useValue: usersService },
        {
          provide: CsvService,
          useValue: jasmine.createSpyObj('CsvService', ['exportToCSV']),
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

  it('[672-improve-assessments-interventions-mobile-view/AC-2] shows each intervention as a card with every field and no horizontal scroll on mobile', () => {
    // GIVEN the intervention "Workshop" of "Luis Gómez", risk level "High", status "In Progress"
    // WHEN the Interventions tab is shown on a 375px wide screen
    create(true);

    // THEN it is a card with every field, and no table is shown
    const cards = all<HTMLElement>('.intervention-card');
    expect(cards.length).toBe(1);
    expect(one('table')).toBeNull();
    const text = cards[0].textContent ?? '';
    [
      'Date',
      '02/20/2026',
      'Type',
      'Individual',
      'Mode',
      'Activity',
      'Workshop',
      'Professional',
      'Luis Gómez',
      'Student',
      'Ana Torres',
      'Area',
      'Academic',
      'Risk Level',
      'High',
      'End Risk Level',
      'Low',
      'Status',
      'In Progress',
      'Comment',
      'First session done',
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

  it('[672-improve-assessments-interventions-mobile-view/AC-5] opens the intervention detail over the whole screen and closes back to the list on mobile', () => {
    // GIVEN the intervention "Workshop" on a 375px wide screen
    create(true);

    // WHEN the user uses the View action
    cardButton('View')!.click();
    fixture.detectChanges();

    // THEN the detail covers the whole screen, with its close button inside it
    const panel = one<HTMLElement>('.slide-panel-area')!;
    const panelRect = panel.getBoundingClientRect();
    const screenRect = wholeScreen();
    expect(one('app-intervention-detail')).not.toBeNull();
    expect(getComputedStyle(panel).position).toBe('fixed');
    expect(panelRect.left).toBe(0);
    expect(panelRect.top).toBe(0);
    expect(panelRect.width).toBe(screenRect.width);
    expect(panelRect.height).toBe(screenRect.height);

    const close = one<HTMLButtonElement>(
      'app-intervention-detail button[aria-label="Close"]'
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
    expect(one('app-intervention-detail')).toBeNull();
    expect(
      getComputedStyle(one<HTMLElement>('.main-content-area')!).display
    ).not.toBe('none');
    expect(all('.intervention-card').length).toBe(1);
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-7] shows View, Edit and Delete as icon buttons on the intervention card', () => {
    // GIVEN an In Progress intervention in an assessment that is not Finalized, on a 375px wide screen
    create(true);
    const component = fixture.componentInstance;
    const edited = jasmine.createSpy('editClicked');
    const deleted = jasmine.createSpy('deleteClicked');
    component.editClicked.subscribe(edited);
    component.deleteClicked.subscribe(deleted);

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
    expect(one('.intervention-card .menu-action')).toBeNull();
    expect(one('.intervention-card [aria-haspopup="menu"]')).toBeNull();

    // AND each one starts with one tap
    edit.click();
    expect(edited).toHaveBeenCalledTimes(1);
    remove.click();
    expect(deleted).toHaveBeenCalledTimes(1);
    view.click();
    fixture.detectChanges();
    expect(one('app-intervention-detail')).not.toBeNull();
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-16] blocks the same actions for a Finalized assessment on mobile', () => {
    // GIVEN a Finalized assessment with one intervention, on a 375px wide screen
    isMobile.set(true);
    fetchResolver.resolve.and.returnValue(
      of([assessment(AssessmentStatus.Finalized)])
    );
    const assessments = TestBed.createComponent(AssessmentListComponent);
    assessments.componentRef.setInput('lookupsLoading', false);
    assessments.detectChanges();

    // WHEN the user opens the Assessments tab
    // THEN the Edit action of the assessment cannot be used
    const assessmentCard = assessments.nativeElement as HTMLElement;
    expect(cardButton('Edit', assessmentCard)!.disabled).toBeTrue();
    expect(cardButton('View', assessmentCard)!.disabled).toBeFalse();
    assessments.destroy();

    // WHEN they select that assessment on the Interventions tab
    create(true, AssessmentStatus.Finalized);

    // THEN the Edit and Delete actions of its intervention cannot be used
    expect(cardButton('Edit')!.disabled).toBeTrue();
    expect(cardButton('Delete')!.disabled).toBeTrue();
    expect(cardButton('View')!.disabled).toBeFalse();

    // AND the "Create Intervention" button above the list is not shown
    expect(one('.page-header')!.textContent).not.toContain(
      'Create Intervention'
    );
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-18] keeps the interventions table, the more menu and the 480px side panel on a 1280px screen', () => {
    // GIVEN an assessment selected on the Interventions tab on a 1280px wide screen
    create(false);

    // THEN the interventions are a table with a "more" menu per row, and no card
    expect(one('table.interventions-table')).not.toBeNull();
    expect(all('.intervention-card').length).toBe(0);
    expect(all('tr.mat-mdc-row').length).toBe(1);
    expect(one('tr.mat-mdc-row .menu-action button')).not.toBeNull();
    expect(one('tr.mat-mdc-row .inline-actions')).not.toBeNull();
    const paginator = one<HTMLElement>('mat-paginator')!;
    expect(
      paginator.querySelector('.mat-mdc-paginator-navigation-first')
    ).not.toBeNull();
    expect(
      paginator.querySelector('.mat-mdc-paginator-page-size')
    ).not.toBeNull();

    // WHEN they use the View action of the intervention
    one<HTMLButtonElement>(
      'tr.mat-mdc-row .inline-actions button[mattooltip="View"]'
    )!.click();
    fixture.detectChanges();

    // THEN the detail is a 480px panel beside the table, which stays visible
    const panel = one<HTMLElement>('.slide-panel-area')!;
    const table = one<HTMLElement>('.main-content-area')!;
    expect(one('app-intervention-detail')).not.toBeNull();
    expect(getComputedStyle(panel).position).not.toBe('fixed');
    expect(getComputedStyle(panel).width).toBe('480px');
    expect(getComputedStyle(table).display).not.toBe('none');
    expect(table.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(panel.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      table.getBoundingClientRect().right
    );
  });
});
