import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { of } from 'rxjs';
import Keycloak from 'keycloak-js';

import { ListStudentsByPollComponent } from './list-students-by-poll.component';
import { StudentService } from '@core/services/api/student.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { StudentModel } from '@core/models/student.model';
import { ModalStudentDetailComponent } from '../../../../shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { EventAction, EventLoad } from '@core/models/load';

describe('ListStudentsByPollComponent', () => {
  let component: ListStudentsByPollComponent;
  let fixture: ComponentFixture<ListStudentsByPollComponent>;

  const mockStudents: StudentModel[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      uuid: 'sis-1',
      isImported: true,
    } as StudentModel,
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      uuid: 'sis-2',
      isImported: false,
    } as StudentModel,
  ];

  const mockStudentService = jasmine.createSpyObj('StudentService', [
    'getData',
  ]);
  const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
  const mockFeatureFlagsService = jasmine.createSpyObj('FeatureFlagsService', [
    'isEnabled',
  ]);

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => null,
      },
    },
    params: of({}),
    queryParams: of({}),
  };

  beforeEach(async () => {
    mockStudentService.getData.and.returnValue(
      of({
        items: mockStudents,
        count: mockStudents.length,
      })
    );
    mockFeatureFlagsService.isEnabled.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ListStudentsByPollComponent],
      providers: [
        { provide: StudentService, useValue: mockStudentService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: FeatureFlagsService, useValue: mockFeatureFlagsService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Keycloak, useValue: {} },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListStudentsByPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockStudentService.getData.calls.reset();
    mockDialog.open.calls.reset();
    mockFeatureFlagsService.isEnabled.calls.reset();
  });

  it('should create and load initial students', () => {
    expect(component).toBeTruthy();
    expect(mockStudentService.getData).toHaveBeenCalledWith({
      pageSize: 10,
      page: 0,
    });
    expect(component.students.length).toBe(2);
    expect(component.totalStudents).toBe(2);
    expect(component.dataStudents.data).toEqual(mockStudents);
  });

  describe('handleLoadCalled', () => {
    it('should update pagination and reload students', () => {
      const event: EventLoad = { page: 2, pageSize: 25 };

      component.handleLoadCalled(event);

      expect(component.pagination).toEqual({ page: 2, pageSize: 25 });
      expect(mockStudentService.getData).toHaveBeenCalledWith({
        page: 2,
        pageSize: 25,
      });
    });
  });

  describe('onPageChange', () => {
    it('should update pagination with pageIndex and pageSize, then reload students', () => {
      const event: PageEvent = {
        pageIndex: 3,
        pageSize: 50,
        length: 100,
      };

      component.onPageChange(event);

      expect(component.pagination).toEqual({ page: 3, pageSize: 50 });
      expect(mockStudentService.getData).toHaveBeenCalledWith({
        page: 3,
        pageSize: 50,
      });
    });
  });

  describe('handleActionCalled', () => {
    it('should call openStudentDetails when student is found (branch true)', () => {
      spyOn(component, 'openStudentDetails');
      const event = {
        data: { id: 'checkDetails' },
        item: { id: 1 },
      } as EventAction;

      component.handleActionCalled(event);

      expect(component.openStudentDetails).toHaveBeenCalledWith(
        mockStudents[0]
      );
    });

    it('should log a warning when student is not found (branch false)', () => {
      spyOn(component, 'openStudentDetails');
      spyOn(console, 'warn');
      const event = {
        data: { id: 'checkDetails' },
        item: { id: 999 },
      } as EventAction;

      component.handleActionCalled(event);

      expect(component.openStudentDetails).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Student not found on array.');
    });
  });

  describe('openStudentDetails', () => {
    it('should open ModalStudentDetailV2Component when studentDetails feature flag is enabled (branch true)', () => {
      mockFeatureFlagsService.isEnabled
        .withArgs(FEATURE_FLAGS.studentDetails)
        .and.returnValue(true);

      component.openStudentDetails(mockStudents[0]);

      expect(mockDialog.open).toHaveBeenCalledWith(
        ModalStudentDetailV2Component,
        jasmine.objectContaining({
          width: '1152px',
          maxWidth: '95vw',
          maxHeight: '921.59px',
          panelClass: 'border-modalbox-dialog',
          data: { studentId: 1 },
        })
      );
    });

    it('should open ModalStudentDetailComponent when studentDetails feature flag is disabled (branch false)', () => {
      mockFeatureFlagsService.isEnabled
        .withArgs(FEATURE_FLAGS.studentDetails)
        .and.returnValue(false);

      component.openStudentDetails(mockStudents[0]);

      expect(mockDialog.open).toHaveBeenCalledWith(
        ModalStudentDetailComponent,
        jasmine.objectContaining({
          width: '1152px',
          maxWidth: '95vw',
          maxHeight: '921.59px',
          panelClass: 'border-modalbox-dialog',
          data: { studentId: 1 },
        })
      );
    });
  });
});
