import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentsComponent } from './assessments.component';
import { provideHttpClient } from '@angular/common/http';
import Keycloak from 'keycloak-js';
import { of, throwError } from 'rxjs';
import { UserDataService } from '@core/services/access/user-data.service';
import { StudentService } from '@core/services/api/student.service';
import { ProfessionalsService } from '@modules/supports-referrals/services/professionals.service';
import { JuServicesService } from '@modules/supports-referrals/services/juServices.service';
import { MatDialog } from '@angular/material/dialog';
import { AssessmentModel } from '@core/models/assessment.model';
import { EditAssessmentModalComponent } from './edit-assessment-modal/edit-assessment-modal.component';
import { NewAssessmentModalComponent } from './new-assessment-modal/new-assessment-modal.component';
import { AssessmentService } from '@core/services/api/assessement.service';

const keycloakMock = {
  token: 'fake-token',
  logout: jasmine.createSpy('logout'),
};

describe('AssessmentsComponent', () => {
  let component: AssessmentsComponent;
  let fixture: ComponentFixture<AssessmentsComponent>;

  let dialog: jasmine.SpyObj<MatDialog>;
  let juServicesService: jasmine.SpyObj<JuServicesService>;
  let professionalsService: jasmine.SpyObj<ProfessionalsService>;
  let studentService: jasmine.SpyObj<StudentService>;
  let userDataService: jasmine.SpyObj<UserDataService>;

  const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
  dialogRef.afterClosed.and.returnValue(of(undefined));

  beforeEach(async () => {
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    juServicesService = jasmine.createSpyObj('JuServicesService', [
      'getAllJuServices',
      'addNewService',
    ]);
    professionalsService = jasmine.createSpyObj('ProfessionalsService', [
      'getAllProfessionals',
      'addNewProfessional',
    ]);
    studentService = jasmine.createSpyObj('StudentService', ['getAllStudents']);
    userDataService = jasmine.createSpyObj('UserDataService', ['user']);
    userDataService.user.and.returnValue({
      fullName: 'John Doe',
    });
    studentService.getAllStudents.and.returnValue(
      of({
        items: [
          {
            id: 1,
            name: 'Student One',
            uuid: '',
            email: 'd',
            isImported: false,
            studentDetail: {
              id: 1,
              studentId: 1,
              enrolledCourses: 2,
              gradedCourses: 2,
              timeDeliveryRate: 6,
              avgScore: 5,
              coursesUnderAvg: 5,
              pureScoreDiff: 1,
              standardScoreDiff: 2,
              lastAccessDays: 1,
            },
            cohortId: 5,
          },
        ],
        count: 1,
      })
    );
    const assessmentServiceMock = {
      getAll: jasmine.createSpy().and.returnValue(of([])),
      deleteAssessment: jasmine.createSpy().and.returnValue(of(undefined)),
      clearCache: jasmine.createSpy(),
    };
    dialog.open.and.returnValue(dialogRef);

    await TestBed.configureTestingModule({
      imports: [AssessmentsComponent],
      providers: [
        provideHttpClient(),
        { provide: Keycloak, useValue: keycloakMock },
        { provide: MatDialog, useValue: dialog },
        { provide: AssessmentService, useValue: assessmentServiceMock },
        { provide: JuServicesService, useValue: juServicesService },
        { provide: ProfessionalsService, useValue: professionalsService },
        { provide: StudentService, useValue: studentService },
        { provide: UserDataService, useValue: userDataService },
      ],
    })
      .overrideComponent(AssessmentsComponent, {
        set: {
          providers: [{ provide: MatDialog, useValue: dialog }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AssessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should throw error by getting lookups', () => {
    juServicesService.getAllJuServices.and.returnValue(
      throwError(() => new Error('boom'))
    );
    expect(component.lookupLoading()).toBeFalse();
  });

  it('should load static lookups on init', () => {
    expect(studentService.getAllStudents).toHaveBeenCalled();
    expect(userDataService.user).toHaveBeenCalled();
    expect(component.lookupLoading()).toBeFalse();
  });

  it('should use mocked dialog', () => {
    expect(component['matDialog']).toBe(dialog);
  });
  it('should open create dialog', () => {
    juServicesService.getAllJuServices.and.returnValue(
      of({
        items: [
          {
            name: 'Speech',
            id: 1,
            audit: {
              createdBy: 'configurator',
              createdAt: new Date(),
              modifiedBy: 'configurator',
              modifiedAt: new Date(),
            },
          },
        ],
        count: 1,
      })
    );
    professionalsService.getAllProfessionals.and.returnValue(
      of({
        items: [
          {
            name: 'Jane',
            id: 1,
            uuid: '1',
            audit: {
              createdBy: 'configurator',
              createdAt: new Date(),
              modifiedBy: 'configurator',
              modifiedAt: new Date(),
            },
          },
        ],
        count: 1,
      })
    );
    component.openCreateModal();

    expect(juServicesService.getAllJuServices).toHaveBeenCalled();
    expect(professionalsService.getAllProfessionals).toHaveBeenCalled();

    expect(dialog.open).toHaveBeenCalledWith(
      NewAssessmentModalComponent,
      jasmine.objectContaining({
        data: jasmine.objectContaining({
          services: jasmine.any(Array),
          professionals: jasmine.any(Array),
        }),
      })
    );
  });

  it('should open edit dialog', () => {
    juServicesService.getAllJuServices.and.returnValue(
      of({ items: [], count: 0 })
    );
    professionalsService.getAllProfessionals.and.returnValue(
      of({ items: [], count: 0 })
    );
    const assessment = {
      id: 10,
    } as AssessmentModel;
    component.openEditModal(assessment);
    expect(dialog.open).toHaveBeenCalledWith(
      EditAssessmentModalComponent,
      jasmine.objectContaining({
        data: jasmine.objectContaining({
          assessment,
        }),
      })
    );
  });

  it('should create a service', () => {
    juServicesService.addNewService.and.returnValue(
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
    expect(juServicesService.addNewService).toHaveBeenCalled();
  });

  it('should create a professional and return lookup value', () => {
    professionalsService.addNewProfessional.and.returnValue(
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
    expect(professionalsService.addNewProfessional).toHaveBeenCalled();
  });

  it('should stop loading when create modal lookup fails', () => {
    juServicesService.getAllJuServices.and.returnValue(
      throwError(() => new Error('Failed loading services'))
    );
    professionalsService.getAllProfessionals.and.returnValue(
      of({
        items: [],
        count: 0,
      })
    );
    component.openCreateModal();
    expect(component.lookupLoading()).toBeFalse();
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should stop loading when edit modal lookup fails', () => {
    juServicesService.getAllJuServices.and.returnValue(
      throwError(() => new Error('Failed loading services'))
    );
    professionalsService.getAllProfessionals.and.returnValue(
      of({
        items: [],
        count: 0,
      })
    );
    component.openEditModal({
      id: 1,
    } as AssessmentModel);
    expect(component.lookupLoading()).toBeFalse();
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should open create modal when there is a preselected student', () => {
    spyOnProperty(history, 'state', 'get').and.returnValue({
      preselectedStudentId: 123,
    });

    juServicesService.getAllJuServices.and.returnValue(
      of({
        items: [],
        count: 0,
      })
    );

    professionalsService.getAllProfessionals.and.returnValue(
      of({
        items: [],
        count: 0,
      })
    );

    component.ngOnInit();

    expect(dialog.open).toHaveBeenCalledWith(
      NewAssessmentModalComponent,
      jasmine.objectContaining({
        data: jasmine.objectContaining({
          preselectedStudentId: 123,
        }),
      })
    );
  });
});
