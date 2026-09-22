import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import Keycloak from 'keycloak-js';

import { AssessmentsComponent } from './assessments.component';
import { StudentService } from '@core/services/api/student.service';
import { JuServicesService } from '@modules/supports-referrals/services/juServices.service';
import { ProfessionalsService } from '@modules/supports-referrals/services/professionals.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NewAssessmentModalComponent } from './new-assessment-modal/new-assessment-modal.component';
import { EditAssessmentModalComponent } from './edit-assessment-modal/edit-assessment-modal.component';
import { AssessmentListComponent } from './assessment-list/assessment-list.component';
import { AssessmentModel } from '@core/models/assessment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ERASPermissions } from '@core/services/permissions/permission.policies';

const keycloakMock = {
  token: 'fake-token',
  logout: jasmine.createSpy('logout'),
};

interface AssessmentLookupsStudent {
  label: string;
  value: number;
}

interface NewAssessmentModalData {
  students: AssessmentLookupsStudent[];
  preselectedStudentId?: number;
  createProfessional?: (name: string) => unknown;
  createService?: (name: string) => unknown;
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
  let professionalsServiceSpy: jasmine.SpyObj<ProfessionalsService>;
  let permissionsServiceSpy: jasmine.SpyObj<PermissionsService>;

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

    professionalsServiceSpy = jasmine.createSpyObj<ProfessionalsService>(
      'ProfessionalsService',
      ['getAllProfessionals', 'addNewProfessional']
    );
    professionalsServiceSpy.getAllProfessionals.and.returnValue(
      of({ items: [], count: 0 })
    );

    permissionsServiceSpy = jasmine.createSpyObj<PermissionsService>(
      'PermissionsService',
      ['can']
    );
    permissionsServiceSpy.can.and.returnValue(false);

    const userDataServiceSpy = jasmine.createSpyObj<UserDataService>(
      'UserDataService',
      ['user']
    );
    const fakeUser = { fullName: 'Test User' } as UserDataServiceUser;
    userDataServiceSpy.user.and.returnValue(fakeUser);

    await TestBed.configureTestingModule({
      imports: [AssessmentsComponent],
      providers: [
        { provide: Keycloak, useValue: keycloakMock },
        { provide: StudentService, useValue: studentServiceSpy },
        { provide: JuServicesService, useValue: juServicesServiceSpy },
        { provide: ProfessionalsService, useValue: professionalsServiceSpy },
        { provide: UserDataService, useValue: userDataServiceSpy },
        { provide: PermissionsService, useValue: permissionsServiceSpy },
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

  it('should log an error and keep loading state when lookups fail to load', () => {
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
    expect(component.lookupLoading()).toBeTrue();
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

  describe('openCreateModal permissions branches', () => {
    it('should attach createProfessional and createService callbacks when user has permissions', () => {
      permissionsServiceSpy.can.and.callFake((perm: string) => {
        return (
          perm === ERASPermissions.CAN_CREATE_PROFESSIONALS ||
          perm === ERASPermissions.CAN_CREATE_SERVICES
        );
      });

      const openSpy = spyOn(MatDialog.prototype, 'open').and.returnValue(
        dialogRefStub
      );

      fixture.detectChanges();
      component.openCreateModal();

      const dialogData = openSpy.calls.mostRecent().args[1]
        ?.data as NewAssessmentModalData;

      expect(dialogData.createProfessional).toBeDefined();
      expect(dialogData.createService).toBeDefined();
    });

    it('should not attach createProfessional or createService when user lacks permissions', () => {
      permissionsServiceSpy.can.and.returnValue(false);

      const openSpy = spyOn(MatDialog.prototype, 'open').and.returnValue(
        dialogRefStub
      );

      fixture.detectChanges();
      component.openCreateModal();

      const dialogData = openSpy.calls.mostRecent().args[1]
        ?.data as NewAssessmentModalData;

      expect(dialogData.createProfessional).toBeUndefined();
      expect(dialogData.createService).toBeUndefined();
    });

    it('should log error and reset lookupLoading when getVolatileLookups fails in openCreateModal', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      const openSpy = spyOn(MatDialog.prototype, 'open');
      const error = new Error('Services error');
      juServicesServiceSpy.getAllJuServices.and.returnValue(
        throwError(() => error)
      );

      fixture.detectChanges();
      component.openCreateModal();

      expect(consoleErrorSpy).toHaveBeenCalledWith('error: ', error);
      expect(component.lookupLoading()).toBeFalse();
      expect(openSpy).not.toHaveBeenCalled();
    });

    it('should safely handle listComponent being undefined when create modal closes', () => {
      spyOn(MatDialog.prototype, 'open').and.returnValue(dialogRefStub);
      fixture.detectChanges();
      setListComponent(component, undefined);

      expect(() => component.openCreateModal()).not.toThrow();
    });
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
      professionalsServiceSpy.getAllProfessionals.and.returnValue(
        throwError(() => error)
      );

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

  describe('createProfessional and createService helper methods', () => {
    it('should create a professional and return lookup value', () => {
      professionalsServiceSpy.addNewProfessional.and.returnValue(
        of({
          id: 1,
          name: 'Jane',
          uuid: 'uuid',
          audit: {
            createdBy: 'test',
            createdAt: new Date(),
            modifiedBy: 'test',
            modifiedAt: new Date(),
          },
        })
      );
      component['createProfessional']('Jane').subscribe(result => {
        expect(result).toEqual({
          label: 'Jane',
          value: 'Jane',
        });
      });
      expect(professionalsServiceSpy.addNewProfessional).toHaveBeenCalled();
    });

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
