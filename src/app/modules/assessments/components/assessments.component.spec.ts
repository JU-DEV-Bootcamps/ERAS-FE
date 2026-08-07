import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AssessmentsComponent } from './assessments.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import Keycloak from 'keycloak-js';
import { StudentService } from '@core/services/api/student.service';
import { JuServicesService } from '@modules/supports-referrals/services/juServices.service';
import { ProfessionalsService } from '@modules/supports-referrals/services/professionals.service';
import { UserDataService } from '@core/services/access/user-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NewAssessmentModalComponent } from './new-assessment-modal/new-assessment-modal.component';

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
}

type UserDataServiceUser = ReturnType<UserDataService['user']>;

describe('AssessmentsComponent', () => {
  let component: AssessmentsComponent;
  let fixture: ComponentFixture<AssessmentsComponent>;
  let studentServiceSpy: jasmine.SpyObj<StudentService>;

  const lightStudents = [
    { id: 1, name: 'Ana' },
    { id: 2, name: 'Beto' },
  ];

  beforeEach(async () => {
    studentServiceSpy = jasmine.createSpyObj<StudentService>('StudentService', [
      'getAllStudentsLight',
    ]);
    studentServiceSpy.getAllStudentsLight.and.returnValue(of(lightStudents));

    const juServicesServiceSpy = jasmine.createSpyObj<JuServicesService>(
      'JuServicesService',
      ['getAllJuServices']
    );
    juServicesServiceSpy.getAllJuServices.and.returnValue(
      of({ items: [], count: 0 })
    );

    const professionalsServiceSpy = jasmine.createSpyObj<ProfessionalsService>(
      'ProfessionalsService',
      ['getAllProfessionals']
    );
    professionalsServiceSpy.getAllProfessionals.and.returnValue(
      of({ items: [], count: 0 })
    );

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
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentsComponent);
    component = fixture.componentInstance;
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
    const openSpy = spyOn(MatDialog.prototype, 'open').and.returnValue({
      afterClosed: () => of(null),
    } as unknown as MatDialogRef<NewAssessmentModalComponent>);

    fixture.detectChanges();
    component.openCreateModal();

    const dialogData = openSpy.calls.mostRecent().args[1]
      ?.data as NewAssessmentModalData;

    expect(dialogData.students).toEqual([
      { label: 'Ana', value: 1 },
      { label: 'Beto', value: 2 },
    ]);
  });
});
