import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';

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
import { ViewportService } from '@core/services/layout/viewport.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { RoleBasedFetchResolver } from '@core/utils/strategies/role-based-fetch-strategy/role-based-fetch.resolver';
import { FilterName } from '@shared/components/list-filters/models/list-filters.interface';
import { ModalDeleteConfirmationComponent } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.component';

import { EditInterventionModalComponent } from './edit-intervention-modal/edit-intervention-modal.component';
import { InterventionsComponent } from './interventions.component';
import { NewInterventionModalComponent } from './new-intervention-modal/new-intervention-modal.component';

const MOBILE_WIDTH = 375;
const DESKTOP_WIDTH = 1280;

describe('InterventionsComponent on mobile and desktop screens', () => {
  let fixture: ComponentFixture<InterventionsComponent>;
  let component: InterventionsComponent;
  let isMobile: WritableSignal<boolean>;
  let openSpy: jasmine.Spy;

  const remitted: AssessmentModel = {
    id: 10,
    createdAtUtc: '2026-03-30T12:00:00Z',
    createdBy: 'officer-sub',
    service: 'Student Services',
    assignedProfessionals: ['professional-sub'],
    studentIds: ['12'],
    students: [
      { id: 12, name: 'Ana Torres', email: 'ana@mail.com', avgRiskLevel: 0 },
    ],
    comments: '',
    status: AssessmentStatus.Remitted,
    interventions: [],
  };

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
  };

  const host = () => fixture.nativeElement as HTMLElement;
  const all = <T extends Element>(selector: string) =>
    Array.from(host().querySelectorAll<T>(selector));

  const configOf = (): MatDialogConfig =>
    openSpy.calls.mostRecent().args[1] as MatDialogConfig;

  const expectFullScreen = (config: MatDialogConfig) => {
    expect(config.width).toBe('100vw');
    expect(config.maxWidth).toBe('100vw');
    expect(config.height).toBe('100dvh');
    expect(config.maxHeight).toBe('100dvh');
    expect(config.panelClass).toEqual(['mobile-fullscreen-dialog']);
    expect(config.disableClose).toBeTrue();
  };

  /** Creates the page with the Remitted assessment selected. */
  const create = (mobile: boolean, closesWith: unknown = undefined) => {
    isMobile.set(mobile);
    openSpy = spyOn(MatDialog.prototype, 'open').and.returnValue({
      afterClosed: () => of(closesWith),
    } as unknown as MatDialogRef<unknown>);
    fixture = TestBed.createComponent(InterventionsComponent);
    component = fixture.componentInstance;
    host().style.display = 'block';
    host().style.width = `${mobile ? MOBILE_WIDTH : DESKTOP_WIDTH}px`;
    fixture.detectChanges();
    component.handleFilters([
      { name: FilterName.Assessment, value: 10 },
      { name: FilterName.Type, value: [InterventionType.Individual] },
      { name: FilterName.Status, value: [InterventionStatus.InProgress] },
      { name: FilterName.Risk, value: [RiskLevels.High] },
    ]);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    isMobile = signal(false);

    const fetchResolver = jasmine.createSpyObj<RoleBasedFetchResolver>(
      'RoleBasedFetchResolver',
      ['resolve']
    );
    fetchResolver.resolve.and.callFake(((
      _service: unknown,
      _strategies: unknown,
      params?: { assessmentId?: number }
    ) =>
      of(
        params?.assessmentId === undefined ? [remitted] : [workshop]
      )) as never);

    const assessmentService = jasmine.createSpyObj<AssessmentService>(
      'AssessmentService',
      ['getById', 'getActivity']
    );
    assessmentService.getById.and.returnValue(of(remitted));

    const interventionService = jasmine.createSpyObj<InterventionService>(
      'InterventionService',
      ['deleteIntervention', 'getActivity']
    );
    interventionService.getActivity.and.returnValue(of([]));

    const usersService = jasmine.createSpyObj<UsersService>('UsersService', [
      'getByRole',
    ]);
    usersService.getByRole.and.returnValue(of([]));

    const attachments = jasmine.createSpyObj<AttachmentApiService>(
      'AttachmentApiService',
      ['list']
    );
    attachments.list.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [InterventionsComponent, ModalDeleteConfirmationComponent],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Keycloak, useValue: { token: 'fake-token' } },
        { provide: ViewportService, useValue: { isMobile } },
        { provide: RoleBasedFetchResolver, useValue: fetchResolver },
        { provide: AssessmentService, useValue: assessmentService },
        { provide: InterventionService, useValue: interventionService },
        { provide: UsersService, useValue: usersService },
        { provide: AttachmentApiService, useValue: attachments },
        {
          provide: ToastNotificationService,
          useValue: jasmine.createSpyObj('ToastNotificationService', [
            'showToast',
          ]),
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Delete Intervention',
            subtitle:
              'This will permanently remove the intervention and all its attachments.',
          },
        },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
      ],
    }).compileComponents();
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-3] stacks the filters and keeps Export and Create Intervention visible on mobile', () => {
    // GIVEN the Interventions tab with an assessment that is not Finalized selected
    // WHEN the tab is shown on a 375px wide screen
    create(true);
    const hostRect = host().getBoundingClientRect();

    // THEN the Assessment, Type, Status and Risk filters are one below the other, none wider than the content
    const filters = all<HTMLElement>(
      'app-list-filters .form-container > *'
    ).map(filter => filter.getBoundingClientRect());
    expect(filters.length).toBe(4);
    filters.forEach((rect, index) => {
      expect(Math.round(rect.width)).toBe(Math.round(hostRect.width));
      expect(rect.left).toBeGreaterThanOrEqual(hostRect.left);
      expect(rect.right).toBeLessThanOrEqual(hostRect.right);
      if (index > 0) {
        expect(rect.top).toBeGreaterThanOrEqual(filters[index - 1].bottom);
      }
    });
    const apply = host()
      .querySelector('app-list-filters .button-container')!
      .getBoundingClientRect();
    expect(apply.top).toBeGreaterThanOrEqual(filters[3].bottom);
    expect(apply.right).toBeLessThanOrEqual(hostRect.right);

    // AND the Export button and the "Create Intervention" button are visible, with no horizontal scroll
    const buttons = all<HTMLButtonElement>(
      'app-intervention-list .page-header button'
    );
    expect(buttons.length).toBe(2);
    expect(buttons[0].getAttribute('aria-label')).toBe('Export CSV');
    expect(buttons[1].textContent).toContain('Create Intervention');
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      expect(rect.width).toBeGreaterThan(0);
      expect(rect.left).toBeGreaterThanOrEqual(hostRect.left);
      expect(rect.right).toBeLessThanOrEqual(hostRect.right);
    });
    expect(host().scrollWidth).toBeLessThanOrEqual(host().clientWidth);
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-10] opens the create intervention form full screen and reloads the list when it is saved', () => {
    // GIVEN an assessment that is not Finalized selected on a mobile screen
    create(true, true);
    const reload = spyOn(component.interventionList, 'loadInterventions');

    // WHEN the user presses "Create Intervention" and the form is saved
    component.openCreateModal();

    // THEN the form covers the whole screen
    expect(openSpy.calls.mostRecent().args[0]).toBe(
      NewInterventionModalComponent
    );
    expectFullScreen(configOf());

    // AND the list is loaded again, so the new intervention appears in it
    expect(reload).toHaveBeenCalledOnceWith(10);
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-12] opens the edit intervention form full screen on mobile', () => {
    // GIVEN an In Progress intervention in an assessment that is not Finalized, on a mobile screen
    create(true);

    // WHEN the user uses the Edit action of the intervention
    component.openEditModal(workshop);

    // THEN the edit form covers the whole screen, with the intervention loaded in it
    expect(openSpy.calls.mostRecent().args[0]).toBe(
      EditInterventionModalComponent
    );
    expectFullScreen(configOf());
    expect(
      (configOf().data as { intervention: InterventionModel }).intervention
    ).toBe(workshop);
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-13] keeps the delete confirmation and its two buttons inside the screen', () => {
    // GIVEN an intervention in an assessment that is not Finalized, on a mobile screen
    create(true);

    // WHEN the user uses the Delete action of the intervention
    component.confirmDelete(workshop);

    // THEN the confirmation is never wider than the screen
    expect(openSpy.calls.mostRecent().args[0]).toBe(
      ModalDeleteConfirmationComponent
    );
    expect(configOf().width).toBe('400px');
    expect(configOf().maxWidth).toBe('calc(100vw - 32px)');

    // AND at that width (343px on a 375px screen) both buttons are visible without horizontal scrolling
    const confirmation = TestBed.createComponent(
      ModalDeleteConfirmationComponent
    );
    const panel = confirmation.nativeElement as HTMLElement;
    panel.style.display = 'block';
    panel.style.width = `${MOBILE_WIDTH - 32}px`;
    confirmation.detectChanges();
    const panelRect = panel.getBoundingClientRect();
    const buttons = Array.from(panel.querySelectorAll('button'));
    expect(buttons.map(button => button.textContent?.trim())).toEqual([
      'Cancel',
      'Delete',
    ]);
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      expect(rect.width).toBeGreaterThan(0);
      expect(rect.left).toBeGreaterThanOrEqual(panelRect.left);
      expect(rect.right).toBeLessThanOrEqual(panelRect.right);
    });
    expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);
  });

  it('hides the filters while the detail covers a mobile screen, and keeps them on desktop', () => {
    const filtersDisplay = () =>
      getComputedStyle(host().querySelector('app-list-filters')!).display;
    const detail = () => host().querySelector('app-intervention-detail');

    create(true);
    expect(filtersDisplay()).not.toBe('none');
    host()
      .querySelector<HTMLButtonElement>('mat-card button[aria-label="View"]')!
      .click();
    fixture.detectChanges();
    expect(detail()).not.toBeNull();
    expect(filtersDisplay()).toBe('none');

    host()
      .querySelector<HTMLButtonElement>(
        'app-intervention-detail button[aria-label="Close"]'
      )!
      .click();
    fixture.detectChanges();
    expect(detail()).toBeNull();
    expect(filtersDisplay()).not.toBe('none');

    isMobile.set(false);
    fixture.detectChanges();
    host()
      .querySelector<HTMLButtonElement>(
        'tr[mat-row] .inline-actions button[mattooltip="View"]'
      )!
      .click();
    fixture.detectChanges();
    expect(detail()).not.toBeNull();
    expect(filtersDisplay()).not.toBe('none');
  });
});
