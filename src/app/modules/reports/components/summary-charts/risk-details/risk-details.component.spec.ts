import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import Keycloak from 'keycloak-js';

import RiskDetailsComponent from './risk-details.component';
import { PollService } from '@core/services/api/poll.service';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { PollAvgQuestion } from '@core/models/summary.model';
import { EventAction, EventLoad } from '@core/models/load';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';

type VariablesResponse =
  ReturnType<PollService['getVariablesByComponents']> extends Observable<
    infer U
  >
    ? U
    : never;
type GetStudentsResponse =
  ReturnType<
    EvaluationDetailsService['getStudentsByFilters']
  > extends Observable<infer U>
    ? U
    : never;

describe('RiskDetailsComponent', () => {
  let component: RiskDetailsComponent;
  let fixture: ComponentFixture<RiskDetailsComponent>;

  let pollServiceSpy: jasmine.SpyObj<PollService>;
  let evaluationDetailsServiceSpy: jasmine.SpyObj<EvaluationDetailsService>;
  let featureFlagsSpy: jasmine.SpyObj<FeatureFlagsService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockDialogData = {
    data: {
      pollUuid: 'poll-uuid-123',
      componentName: 'Ansiedad',
      cohorts: [1, 2],
      evaluationId: 10,
      riskGroup: { data: [] },
    },
  };

  beforeEach(async () => {
    pollServiceSpy = jasmine.createSpyObj('PollService', [
      'getVariablesByComponents',
    ]);
    evaluationDetailsServiceSpy = jasmine.createSpyObj(
      'EvaluationDetailsService',
      ['getStudentsByFilters']
    );
    featureFlagsSpy = jasmine.createSpyObj('FeatureFlagsService', [
      'isEnabled',
    ]);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    pollServiceSpy.getVariablesByComponents.and.returnValue(
      of([] as unknown as VariablesResponse)
    );
    evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
      of({ items: [], count: 0 } as unknown as GetStudentsResponse)
    );
    featureFlagsSpy.isEnabled.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [RiskDetailsComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: PollService, useValue: pollServiceSpy },
        {
          provide: EvaluationDetailsService,
          useValue: evaluationDetailsServiceSpy,
        },
        { provide: FeatureFlagsService, useValue: featureFlagsSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Keycloak, useValue: {} },
        provideHttpClient(),
        provideNoopAnimations(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(RiskDetailsComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RiskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleLoadCalled', () => {
    it('should update pagination and call loadComponentsAndVariables', () => {
      const risk = {
        question: 'Q1',
        position: 1,
      } as unknown as PollAvgQuestion;
      spyOn(component, 'loadComponentsAndVariables');

      const event: EventLoad = { page: 3, pageSize: 25 };
      component.handleLoadCalled(event, risk);

      expect(component.pagination).toEqual({ page: 3, pageSize: 25 });
      expect(component.loadComponentsAndVariables).toHaveBeenCalledWith(risk);
    });
  });

  describe('loadComponentsAndVariables', () => {
    it('should set variableId and call loadStudentList when variable matches question and position', () => {
      const risk = {
        question: 'Q1',
        position: 1,
      } as unknown as PollAvgQuestion;
      pollServiceSpy.getVariablesByComponents.and.returnValue(
        of([
          { id: 99, name: 'Q1', position: 1 },
          { id: 100, name: 'Q2', position: 2 },
        ] as unknown as VariablesResponse)
      );
      spyOn(component, 'loadStudentList');

      component.loadComponentsAndVariables(risk);

      expect(pollServiceSpy.getVariablesByComponents).toHaveBeenCalledWith(
        'poll-uuid-123',
        ['ansiedad'],
        true
      );
      expect(component.variableId).toBe(99);
      expect(component.loadStudentList).toHaveBeenCalledWith(risk);
    });

    it('should return early without updating variableId if no variable matches', () => {
      const risk = {
        question: 'Q1',
        position: 1,
      } as unknown as PollAvgQuestion;
      pollServiceSpy.getVariablesByComponents.and.returnValue(
        of([
          { id: 99, name: 'Other Question', position: 2 },
        ] as unknown as VariablesResponse)
      );
      spyOn(component, 'loadStudentList');
      component.variableId = 0;

      component.loadComponentsAndVariables(risk);

      expect(component.variableId).toBe(0);
      expect(component.loadStudentList).not.toHaveBeenCalled();
    });
  });

  describe('loadStudentList', () => {
    it('should return early if variableId is 0', () => {
      component.variableId = 0;
      const risk = {
        question: 'Q1',
        position: 1,
      } as unknown as PollAvgQuestion;

      component.loadStudentList(risk);

      expect(
        evaluationDetailsServiceSpy.getStudentsByFilters
      ).not.toHaveBeenCalled();
    });

    it('should fetch students, sort them by riskLevel desc and answerText asc, and update map and signal', () => {
      component.variableId = 15;
      component.pagination = { page: 1, pageSize: 10 };
      const risk = {
        question: 'Q1',
        position: 1,
      } as unknown as PollAvgQuestion;

      const mockStudents = [
        { id: 1, riskLevel: 1, answerText: 'Zebra' },
        { id: 2, riskLevel: 3, answerText: 'Beta' },
        { id: 3, riskLevel: 3, answerText: 'Alpha' },
      ] as unknown as EvaluationDetailsStudentResponse[];

      evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
        of({ items: mockStudents, count: 3 } as unknown as GetStudentsResponse)
      );

      component.loadStudentList(risk);

      expect(
        evaluationDetailsServiceSpy.getStudentsByFilters
      ).toHaveBeenCalledWith(
        'poll-uuid-123',
        ['ansiedad'],
        [1, 2],
        [15],
        10,
        1,
        undefined,
        10
      );

      const storedData = component.riskStudentData.get(1);
      expect(storedData).toBeDefined();
      expect(storedData?.total).toBe(3);
      expect(component.totalStudentRisks()).toBe(3);

      expect(storedData?.items[0].id).toBe(3);
      expect(storedData?.items[1].id).toBe(2);
      expect(storedData?.items[2].id).toBe(1);
    });

    it('should handle null/empty response safely', () => {
      component.variableId = 15;
      const risk = {
        question: 'Q1',
        position: 1,
      } as unknown as PollAvgQuestion;

      evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
        of(null as unknown as GetStudentsResponse)
      );

      component.loadStudentList(risk);

      const storedData = component.riskStudentData.get(1);
      expect(storedData).toEqual({ items: [], total: 0 });
      expect(component.totalStudentRisks()).toBe(0);
    });
  });

  describe('handleActionCalled', () => {
    it('should call openStudentDetails when action id is openStudentDetails', () => {
      spyOn(component, 'openStudentDetails');

      const event = {
        data: { id: 'openStudentDetails' },
        item: { id: 77 },
      } as unknown as EventAction;
      component.handleActionCalled(event);

      expect(component.openStudentDetails).toHaveBeenCalledWith(77);
    });

    it('should do nothing when action id is unknown', () => {
      spyOn(component, 'openStudentDetails');

      const event = {
        data: { id: 'unknownAction' },
        item: { id: 77 },
      } as unknown as EventAction;
      component.handleActionCalled(event);

      expect(component.openStudentDetails).not.toHaveBeenCalled();
    });
  });

  describe('openStudentDetails', () => {
    it('should open ModalStudentDetailV2Component when feature flag is enabled', () => {
      featureFlagsSpy.isEnabled
        .withArgs(FEATURE_FLAGS.studentDetails)
        .and.returnValue(true);

      component.openStudentDetails(42);

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ModalStudentDetailV2Component,
        {
          width: '1152px',
          maxWidth: '95vw',
          maxHeight: '921.59px',
          panelClass: 'border-modalbox-dialog',
          data: { studentId: 42 },
        }
      );
    });

    it('should open ModalStudentDetailComponent when feature flag is disabled', () => {
      featureFlagsSpy.isEnabled
        .withArgs(FEATURE_FLAGS.studentDetails)
        .and.returnValue(false);

      component.openStudentDetails(42);

      expect(dialogSpy.open).toHaveBeenCalledWith(ModalStudentDetailComponent, {
        width: '1152px',
        maxWidth: '95vw',
        maxHeight: '921.59px',
        panelClass: 'border-modalbox-dialog',
        data: { studentId: 42 },
      });
    });
  });
});
