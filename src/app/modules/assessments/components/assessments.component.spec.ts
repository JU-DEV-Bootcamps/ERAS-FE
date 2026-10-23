import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import Keycloak from 'keycloak-js';

import { AssessmentsComponent } from './assessments.component';
import { StudentService } from '@core/services/api/student.service';
import { JuServicesService } from '@modules/supports-referrals/services/juServices.service';
import { UsersService } from '@core/services/api/users.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NewAssessmentModalComponent } from './new-assessment-modal/new-assessment-modal.component';
import { EditAssessmentModalComponent } from './edit-assessment-modal/edit-assessment-modal.component';
import { AssessmentListComponent } from './assessment-list/assessment-list.component';
import { AssessmentModel } from '@core/models/assessment.model';

const keycloakMock = {
  token: 'fake-token',
  logout: jasmine.createSpy('logout'),
};

interface AssessmentLookupsStudent {
  label: string;
  value: number;
}

interface LookupEntry {
  label: string;
  value: string;
}

interface NewAssessmentModalData {
  students: AssessmentLookupsStudent[];
  preselectedStudentId?: number;
  createService?: (name: string) => unknown;
  services?: LookupEntry[];
  professionals?: LookupEntry[];
}

type UserDataServiceUser = ReturnType<UserDataService['user']>;

interface WithListComponentSignal {
  listComponent: () => AssessmentListComponent | undefined;
}

function setListComponent(
  cmp: AssessmentsComponent,
  mock: AssessmentListComponent | undefined
): void {
  (cmp as unknown as WithListComponentSignal).listComponent = () => mock;
}

describe('AssessmentsComponent', () => {
  let component: AssessmentsComponent;
  let fixture: ComponentFixture<AssessmentsComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;
  let juServicesServiceSpy: jasmine.SpyObj<JuServicesService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;

  const lightStudents = [
    { id: 1, name: 'Ana' },
    { id: 2, name: 'Beto' },
  ];

  const dialogRefStub = {
    afterClosed: () => of(null),
  } as unknown as MatDialogRef<NewAssessmentModalComponent>;

  const buildMockListComponent = (): jasmine.SpyObj<AssessmentListComponent> =>
    jasmine.createSpyObj<AssessmentListComponent>('AssessmentListComponent', [
      'loadAssessments',
    ]);

  beforeEach(async () => {
    studentServiceSpy = jasmine.createSpyObj<StudentService>('StudentService', [
      'getAllStudentsLight',
    ]);
    studentServiceSpy.getAllStudentsLight.and.returnValue(of(lightStudents));

    juServicesServiceSpy = jasmine.createSpyObj<JuServicesService>(
      'JuServicesService',
      ['getAllJuServices', 'addNewService']
    );
    juServicesServiceSpy.getAllJuServices.and.returnValue(
      of({ items: [], count: 0 })
    );

    usersServiceSpy = jasmine.createSpyObj<UsersService>('UsersService', [
      'getByRole',
      'sync',
    ]);
    usersServiceSpy.getByRole.and.returnValue(of([]));

    const userDataServiceSpy = jasmine.createSpyObj<UserDataService>(
      'UserDataService',
      ['user']
    );
    const fakeUser = {
      id: 'test-user-sub',
      fullName: 'Test User',
    } as UserDataServiceUser;
    userDataServiceSpy.user.and.returnValue(fakeUser);

    await TestBed.configureTestingModule({
      imports: [AssessmentsComponent],
      providers: [
        { provide: Keycloak, useValue: keycloakMock },
        { provide: StudentService, useValue: studentServiceSpy },
        { provide: JuServicesService, useValue: juServicesServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: UserDataService, useValue: userDataServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    history.replaceState({}, '');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should fetch students via the light endpoint, not the paged one', () => {
    fixture.detectChanges();
    expect(studentServiceSpy.getAllStudentsLight).toHaveBeenCalled();
  });

  it('should map the flat light-students array into lookups (no .items wrapper)', () => {
    const openSpy = spyOn(MatDialog.prototype, 'open').and.returnValue(
      dialogRefStub
    );

    fixture.detectChanges();
    component.openCreateModal();

    const dialogData = openSpy.calls.mostRecent().args[1]
      ?.data as NewAssessmentModalData;

    expect(dialogData.students).toEqual([
      { label: 'Ana', value: 1 },
      { label: 'Beto', value: 2 },
    ]);
    expect(dialogData.preselectedStudentId).toBeUndefined();
  });

  it('should populate services and professionals on the first call to openCreateModal, without needing to reopen it', () => {
    juServicesServiceSpy.getAllJuServices.and.returnValue(
      of({
        items: [
          {
            id: 1,
            name: 'Counseling',
            audit: {
              createdBy: 'tester',
              createdAt: new Date(),
              modifiedBy: 'tester',
              modifiedAt: new Date(),
            },
          },
        ],
        count: 1,
      })
    );
    usersServiceSpy.getByRole.and.returnValue(
      of([
        {
          sub: 'sub-1',
          email: 'pro@test.com',
          firstName: 'Pro',
          lastName: 'Fessional',
          role: 'ERAS Professional',
        },
      ])
    );
    const openSpy = spyOn(MatDialog.prototype, 'open').and.returnValue(
      dialogRefStub
    );

    fixture.detectChanges();
    component.openCreateModal();

    const dialogData = openSpy.calls.mostRecent().args[1]
      ?.data as NewAssessmentModalData;

    expect(dialogData.services).toEqual([
      { label: 'Counseling', value: 'Counseling' },
    ]);
    expect(dialogData.professionals).toEqual([
      { label: 'Pro Fessional', value: 'sub-1' },
    ]);
  });

  it('should log an error and clear loading state when lookups fail to load', () => {
    const consoleErrorSpy = spyOn(console, 'error');
    const error = new Error('Failed');
    studentServiceSpy.getAllStudentsLight.and.returnValue(
      throwError(() => error)
    );

    fixture.detectChanges();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error retrieving static lookups',
      error
    );
    expect(component.lookupLoading()).toBeFalse();
  });

  it('should open the create modal with the preselected student and clear the history state', () => {
    spyOnProperty(history, 'state', 'get').and.returnValue({
      preselectedStudentId: 5,
    });
    const replaceStateSpy = spyOn(history, 'replaceState');
    const openCreateModalSpy = spyOn(
      component,
      'openCreateModal'
    ).and.callThrough();
    spyOn(MatDialog.prototype, 'open').and.returnValue(dialogRefStub);

    fixture.detectChanges();

    expect(openCreateModalSpy).toHaveBeenCalledWith(5);
    expect(replaceStateSpy).toHaveBeenCalledWith({}, '');
  });

  it('should not open the create modal when there is no preselected student id', () => {
    spyOnProperty(history, 'state', 'get').and.returnValue({});
    const openCreateModalSpy = spyOn(component, 'openCreateModal');

    fixture.detectChanges();

    expect(openCreateModalSpy).not.toHaveBeenCalled();
  });

  describe('openEditModal', () => {
    it('should open the edit modal with assessment and lookups data, and reload on close', () => {
      const openSpy = spyOn(MatDialog.prototype, 'open').and.returnValue(
        dialogRefStub
      );
      fixture.detectChanges();

      const mockListComponent = buildMockListComponent();
      setListComponent(component, mockListComponent);

      const assessment = { id: 1 } as AssessmentModel;
      component.openEditModal(assessment);

      expect(openSpy).toHaveBeenCalledWith(
        EditAssessmentModalComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({ assessment }),
        })
      );
      expect(mockListComponent.loadAssessments).toHaveBeenCalled();
    });

    it('should log error and reset lookupLoading when getVolatileLookups fails in openEditModal', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const openSpy = spyOn(MatDialog.prototype, 'open');
      const error = new Error('Professionals error');
      usersServiceSpy.getByRole.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.openEditModal({ id: 1 } as AssessmentModel);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error retrieving lookups',
        error
      );
      expect(component.lookupLoading()).toBeFalse();
      expect(openSpy).not.toHaveBeenCalled();
    });

    it('should safely handle listComponent being undefined when edit modal closes', () => {
      spyOn(MatDialog.prototype, 'open').and.returnValue(dialogRefStub);
      fixture.detectChanges();
      setListComponent(component, undefined);

      expect(() =>
        component.openEditModal({ id: 1 } as AssessmentModel)
      ).not.toThrow();
    });
  });

  it('should reload assessments after the create modal closes', () => {
    spyOn(MatDialog.prototype, 'open').and.returnValue(dialogRefStub);
    fixture.detectChanges();

    const mockListComponent = buildMockListComponent();
    setListComponent(component, mockListComponent);

    component.openCreateModal();

    expect(mockListComponent.loadAssessments).toHaveBeenCalled();
  });

  describe('openDeleteModal', () => {
    it('should do nothing when deleting an assessment without an id', () => {
      fixture.detectChanges();

      const mockListComponent = buildMockListComponent();
      setListComponent(component, mockListComponent);

      component.openDeleteModal({ id: undefined } as AssessmentModel);

      expect(mockListComponent.loadAssessments).not.toHaveBeenCalled();
    });

    it('should reload assessments when deleting an assessment with an id', () => {
      fixture.detectChanges();

      const mockListComponent = buildMockListComponent();
      setListComponent(component, mockListComponent);

      component.openDeleteModal({ id: 3 } as AssessmentModel);

      expect(mockListComponent.loadAssessments).toHaveBeenCalled();
    });

    it('should safely do nothing if listComponent is undefined when deleting an assessment with id', () => {
      fixture.detectChanges();
      setListComponent(component, undefined);

      expect(() =>
        component.openDeleteModal({ id: 3 } as AssessmentModel)
      ).not.toThrow();
    });
  });

  describe('createService helper method', () => {
    it('should create a service', () => {
      juServicesServiceSpy.addNewService.and.returnValue(
        of({
          id: 1,
          name: 'Speech',
          audit: {
            createdBy: 'test',
            createdAt: new Date(),
            modifiedBy: 'test',
            modifiedAt: new Date(),
          },
        })
      );
      component['createService']('Speech').subscribe(result => {
        expect(result).toEqual({
          label: 'Speech',
          value: 'Speech',
        });
      });
      expect(juServicesServiceSpy.addNewService).toHaveBeenCalled();
    });
  });
});
