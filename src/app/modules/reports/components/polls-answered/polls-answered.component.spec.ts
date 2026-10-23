import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import Keycloak from 'keycloak-js';

import { PollsAnsweredComponent } from './polls-answered.component';
import { PollInstanceService } from '@core/services/api/poll-instance.service';
import { CohortService } from '@core/services/api/cohort.service';
import { PollService } from '@core/services/api/poll.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { MatDialog } from '@angular/material/dialog';

import { ModalStudentDetailComponent } from '../../../../shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { Filter } from '../../components/poll-filters/types/filters';
import { EventAction, EventLoad } from '@core/models/load';
import { PollModel } from '@core/models/poll.model';

type PollInstancesResponse =
  ReturnType<
    PollInstanceService['getPollInstancesByFilters']
  > extends Observable<infer U>
    ? U
    : never;
type CohortsResponse =
  ReturnType<CohortService['getCohorts']> extends Observable<infer U>
    ? U
    : never;
type PollsResponse =
  ReturnType<PollService['getPollsByCohortId']> extends Observable<infer U>
    ? U
    : never;

describe('PollsAnsweredComponent', () => {
  let component: PollsAnsweredComponent;
  let fixture: ComponentFixture<PollsAnsweredComponent>;
  let mockPollInstanceService: jasmine.SpyObj<PollInstanceService>;
  let mockCohortService: jasmine.SpyObj<CohortService>;
  let mockPollService: jasmine.SpyObj<PollService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockFeatureFlagsService: jasmine.SpyObj<FeatureFlagsService>;

  beforeEach(async () => {
    mockPollInstanceService = jasmine.createSpyObj<PollInstanceService>(
      'PollInstanceService',
      ['getPollInstancesByFilters']
    );
    mockCohortService = jasmine.createSpyObj<CohortService>('CohortService', [
      'getCohorts',
    ]);
    mockPollService = jasmine.createSpyObj<PollService>('PollService', [
      'getPollsByCohortId',
      'getAllPolls',
    ]);
    mockDialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    mockFeatureFlagsService = jasmine.createSpyObj<FeatureFlagsService>(
      'FeatureFlagsService',
      ['isEnabled']
    );

    mockPollInstanceService.getPollInstancesByFilters.and.returnValue(
      of({ body: { items: [], count: 0 } } as unknown as PollInstancesResponse)
    );
    mockCohortService.getCohorts.and.returnValue(
      of({ body: [] } as unknown as CohortsResponse)
    );
    mockPollService.getPollsByCohortId.and.returnValue(
      of([] as unknown as PollsResponse)
    );
    mockPollService.getAllPolls.and.returnValue(
      of([] as unknown as PollsResponse)
    );
    mockFeatureFlagsService.isEnabled.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [PollsAnsweredComponent],
      providers: [
        { provide: PollInstanceService, useValue: mockPollInstanceService },
        { provide: CohortService, useValue: mockCohortService },
        { provide: PollService, useValue: mockPollService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: FeatureFlagsService, useValue: mockFeatureFlagsService },
        { provide: Keycloak, useValue: {} },
        provideNoopAnimations(),
        provideHttpClient(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PollsAnsweredComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PollsAnsweredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cohorts on init and append default option', () => {
    expect(mockCohortService.getCohorts).toHaveBeenCalled();
    expect(component.cohortsData.length).toBeGreaterThan(0);
    expect(component.cohortsData[component.cohortsData.length - 1].name).toBe(
      'All Cohorts'
    );
  });

  describe('checkScreenSize', () => {
    it('should update isMobile to true when window innerWidth < 768', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        configurable: true,
      });
      component.checkScreenSize();
      expect(component.isMobile).toBeTrue();
    });

    it('should update isMobile to false when window innerWidth >= 768', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 1000,
        configurable: true,
      });
      component.checkScreenSize();
      expect(component.isMobile).toBeFalse();
    });
  });

  describe('getPollsByCohortId', () => {
    it('should fetch polls and assign them', () => {
      const mockPolls = [{ id: 1, name: 'Poll 1' }] as unknown as PollModel[];
      mockPollService.getPollsByCohortId.and.returnValue(
        of(mockPolls as unknown as PollsResponse)
      );

      component.getPollsByCohortId(123);

      expect(mockPollService.getPollsByCohortId).toHaveBeenCalledWith(123);
      expect(component.polls).toEqual(mockPolls);
    });
  });

  describe('loadPollInstances', () => {
    it('should fetch instances, flatten them and sort by student name', () => {
      const mockResponse = {
        body: {
          items: [
            { student: { name: 'Zebra' } },
            { student: { name: 'Alpha' } },
          ],
          count: 2,
        },
      } as unknown as PollInstancesResponse;
      mockPollInstanceService.getPollInstancesByFilters.and.returnValue(
        of(mockResponse)
      );

      component.selectedPollUuid = 'test-uuid';
      component.selectedCohortIds = [1];
      component.lastVersion = true;
      component.evaluationId = 5;

      const event: EventLoad = { page: 2, pageSize: 20 };
      component.loadPollInstances(event);

      expect(
        mockPollInstanceService.getPollInstancesByFilters
      ).toHaveBeenCalledWith({
        cohortIds: [1],
        page: 2,
        pageSize: 20,
        lastVersion: true,
        pollUuid: 'test-uuid',
        evaluationId: 5,
      });

      expect(component.totalPollInstances).toBe(2);
      expect(component.pollInstances[0]['student.name']).toBe('Alpha');
      expect(component.pollInstances[1]['student.name']).toBe('Zebra');
    });
  });

  describe('load', () => {
    it('should not load if selectedPollUuid is empty', () => {
      component.selectedPollUuid = '';
      mockPollInstanceService.getPollInstancesByFilters.calls.reset();

      component.load();

      expect(
        mockPollInstanceService.getPollInstancesByFilters
      ).not.toHaveBeenCalled();
    });

    it('should fetch, flatten, and update status variables correctly when results exist', () => {
      component.selectedPollUuid = 'poll-123';
      const mockResponse = {
        body: {
          items: [{ student: { name: 'A' } }],
          count: 1,
        },
      } as unknown as PollInstancesResponse;
      mockPollInstanceService.getPollInstancesByFilters.and.returnValue(
        of(mockResponse)
      );

      component.load();

      expect(component.loading).toBeFalse();
      expect(component.hasNoResults).toBeFalse();
      expect(component.totalPollInstances).toBe(1);
    });

    it('should set hasNoResults to true when count is 0', () => {
      component.selectedPollUuid = 'poll-123';
      mockPollInstanceService.getPollInstancesByFilters.and.returnValue(
        of({
          body: { items: [], count: 0 },
        } as unknown as PollInstancesResponse)
      );

      component.load();

      expect(component.loading).toBeFalse();
      expect(component.hasNoResults).toBeTrue();
      expect(component.totalPollInstances).toBe(0);
    });
  });

  describe('goToDetails', () => {
    it('should open ModalStudentDetailComponent if feature flag is disabled', () => {
      mockFeatureFlagsService.isEnabled.and.returnValue(false);

      const event = {
        item: { 'student.id': 100 },
        data: { id: 'seeStudentDetails' },
      } as unknown as EventAction;
      component.goToDetails(event);

      expect(mockFeatureFlagsService.isEnabled).toHaveBeenCalledWith(
        FEATURE_FLAGS.studentDetails
      );
      expect(mockDialog.open).toHaveBeenCalledWith(
        ModalStudentDetailComponent,
        jasmine.objectContaining({
          data: { studentId: 100 },
        })
      );
    });

    it('should open ModalStudentDetailV2Component if feature flag is enabled', () => {
      mockFeatureFlagsService.isEnabled.and.returnValue(true);

      const event = {
        item: { 'student.id': 200 },
        data: { id: 'seeStudentDetails' },
      } as unknown as EventAction;
      component.goToDetails(event);

      expect(mockDialog.open).toHaveBeenCalledWith(
        ModalStudentDetailV2Component,
        jasmine.objectContaining({
          data: { studentId: 200 },
        })
      );
    });
  });

  describe('handleFilterSelect', () => {
    it('should update class properties and trigger load', () => {
      spyOn(component, 'load');

      const filter: Filter = {
        uuid: 'new-uuid',
        cohortIds: [1, 2],
        lastVersion: false,
        evaluationId: 10,
        title: 'Title',
        variableIds: [],
        selectedComponents: [],
      };

      component.handleFilterSelect(filter);

      expect(component.hasNoResults).toBeFalse();
      expect(component.selectedPollUuid).toBe('new-uuid');
      expect(component.selectedCohortIds).toEqual([1, 2]);
      expect(component.lastVersion).toBeFalse();
      expect(component.evaluationId).toBe(10);
      expect(component.loading).toBeTrue();
      expect(component.load).toHaveBeenCalled();
    });
  });

  describe('getWidth & showEmpty', () => {
    it('should return correct width for columns in getWidth', () => {
      expect(component.getWidth('modifiedAt')).toBe('15%');
      expect(component.getWidth('finishedAt')).toBe('15%');
      expect(component.getWidth('name')).toBe('20%');
      expect(component.getWidth('email')).toBe('20%');
      expect(component.getWidth('uuid')).toBe('');
    });

    it('should return true when pollUuid is empty', () => {
      component.selectedPollUuid = '';
      expect(component.showEmpty).toBeTrue();
    });

    it('should return false when pollUuid exists', () => {
      component.selectedPollUuid = 'poll-123';
      expect(component.showEmpty).toBeFalse();
    });
  });
});
