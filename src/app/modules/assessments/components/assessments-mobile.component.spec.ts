import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';

import {
  AssessmentModel,
  AssessmentStatus,
} from '@core/models/assessment.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { StudentService } from '@core/services/api/student.service';
import { UsersService } from '@core/services/api/users.service';
import { ViewportService } from '@core/services/layout/viewport.service';
import { JuServicesService } from '@modules/supports-referrals/services/juServices.service';

import { RoleBasedFetchResolver } from '@core/utils/strategies/role-based-fetch-strategy/role-based-fetch.resolver';

import { AssessmentListComponent } from './assessment-list/assessment-list.component';
import { InterventionsComponent } from './interventions/interventions.component';
import { NewInterventionModalComponent } from './interventions/new-intervention-modal/new-intervention-modal.component';
import { AssessmentsComponent } from './assessments.component';
import { EditAssessmentModalComponent } from './edit-assessment-modal/edit-assessment-modal.component';
import { NewAssessmentModalComponent } from './new-assessment-modal/new-assessment-modal.component';

describe('AssessmentsComponent on mobile and desktop screens', () => {
  let fixture: ComponentFixture<AssessmentsComponent>;
  let component: AssessmentsComponent;
  let isMobile: WritableSignal<boolean>;
  let openSpy: jasmine.Spy;
  let list: jasmine.SpyObj<AssessmentListComponent>;

  const remitted: AssessmentModel = {
    id: 7,
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

  const configOf = (): MatDialogConfig =>
    openSpy.calls.mostRecent().args[1] as MatDialogConfig;

  const expectFullScreen = (config: MatDialogConfig) => {
    expect(config.width).toBe('100vw');
    expect(config.maxWidth).toBe('100vw');
    expect(config.minWidth).toBeUndefined();
    expect(config.height).toBe('100dvh');
    expect(config.maxHeight).toBe('100dvh');
    expect(config.panelClass).toEqual([
      'assessment-modal-panel',
      'mobile-fullscreen-dialog',
    ]);
  };

  const create = (mobile: boolean, closesWith: unknown = undefined) => {
    isMobile.set(mobile);
    openSpy = spyOn(MatDialog.prototype, 'open').and.returnValue({
      afterClosed: () => of(closesWith),
    } as unknown as MatDialogRef<unknown>);
    fixture = TestBed.createComponent(AssessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    list = jasmine.createSpyObj<AssessmentListComponent>(
      'AssessmentListComponent',
      ['loadAssessments']
    );
    (
      component as unknown as {
        listComponent: () => AssessmentListComponent;
      }
    ).listComponent = () => list;
  };

  beforeEach(async () => {
    isMobile = signal(false);

    const studentService = jasmine.createSpyObj<StudentService>(
      'StudentService',
      ['getAllStudentsLight']
    );
    studentService.getAllStudentsLight.and.returnValue(
      of([{ id: 12, name: 'Ana Torres' }])
    );

    const juServices = jasmine.createSpyObj<JuServicesService>(
      'JuServicesService',
      ['getAllJuServices', 'addNewService']
    );
    juServices.getAllJuServices.and.returnValue(of({ items: [], count: 0 }));

    const usersService = jasmine.createSpyObj<UsersService>('UsersService', [
      'getByRole',
    ]);
    usersService.getByRole.and.returnValue(of([]));

    const userData = jasmine.createSpyObj<UserDataService>('UserDataService', [
      'user',
    ]);
    userData.user.and.returnValue({
      id: 'officer-sub',
      fullName: 'Marta Ruiz',
    } as ReturnType<UserDataService['user']>);

    const fetchResolver = jasmine.createSpyObj<RoleBasedFetchResolver>(
      'RoleBasedFetchResolver',
      ['resolve']
    );
    fetchResolver.resolve.and.returnValue(of([remitted]));

    await TestBed.configureTestingModule({
      imports: [AssessmentsComponent, InterventionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Keycloak, useValue: { token: 'fake-token' } },
        { provide: ViewportService, useValue: { isMobile } },
        { provide: RoleBasedFetchResolver, useValue: fetchResolver },
        { provide: StudentService, useValue: studentService },
        { provide: JuServicesService, useValue: juServices },
        { provide: UsersService, useValue: usersService },
        { provide: UserDataService, useValue: userData },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    history.replaceState({}, '');
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-9] opens the create assessment form full screen and reloads the list when it is saved', () => {
    // GIVEN a user on the Assessments tab on a mobile screen
    create(true, { id: 8 });

    // WHEN they press "Create Assessment" and the form is saved
    component.openCreateModal();

    // THEN the form covers the whole screen
    expect(openSpy.calls.mostRecent().args[0]).toBe(
      NewAssessmentModalComponent
    );
    expectFullScreen(configOf());

    // AND the list is loaded again, so the new assessment appears in it
    expect(list.loadAssessments).toHaveBeenCalledTimes(1);
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-11] opens the edit assessment form full screen on mobile', () => {
    // GIVEN a Remitted assessment on a mobile screen
    create(true);

    // WHEN the user uses the Edit action of the assessment
    component.openEditModal(remitted);

    // THEN the edit form covers the whole screen, with the assessment loaded in it
    expect(openSpy.calls.mostRecent().args[0]).toBe(
      EditAssessmentModalComponent
    );
    expectFullScreen(configOf());
    expect(
      (configOf().data as { assessment: AssessmentModel }).assessment
    ).toBe(remitted);
  });

  it('[672-improve-assessments-interventions-mobile-view/AC-19] keeps the desktop sizes of the assessment and intervention forms', () => {
    // GIVEN a user on a 1280px wide screen
    create(false);

    // WHEN they open the form to create an assessment
    component.openCreateModal();

    // THEN it opens centered at 40% of the screen width (512px at 1280px), not full screen
    expect(openSpy.calls.mostRecent().args[0]).toBe(
      NewAssessmentModalComponent
    );
    expect(configOf().width).toBe('40vw');
    expect(configOf().minWidth).toBe('500px');
    expect(configOf().maxWidth).toBeUndefined();
    expect(configOf().height).toBeUndefined();
    expect(configOf().maxHeight).toBeUndefined();
    expect(configOf().panelClass).toBe('assessment-modal-panel');

    // WHEN they open the form to create an intervention
    const interventions = TestBed.createComponent(InterventionsComponent);
    interventions.detectChanges();
    interventions.componentInstance.selectedAssessmentId.set(remitted.id!);
    interventions.componentInstance.openCreateModal();

    // THEN it opens at 520px, not full screen
    expect(openSpy.calls.mostRecent().args[0]).toBe(
      NewInterventionModalComponent
    );
    expect(configOf().width).toBe('520px');
    expect(configOf().maxWidth).toBeUndefined();
    expect(configOf().height).toBeUndefined();
    expect(configOf().maxHeight).toBeUndefined();
    expect(configOf().panelClass).toBeUndefined();
  });
});
