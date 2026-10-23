import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ColumnRiskPanelComponent,
  ColumnRiskPanelData,
} from './column-risk-panel.component';
import { MatDialog } from '@angular/material/dialog';
import { PollService } from '@core/services/api/poll.service';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PollAvgQuestion } from '@core/models/summary.model';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';
import { EventAction } from '@core/models/load';

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

describe('ColumnRiskPanelComponent', () => {
  let component: ColumnRiskPanelComponent;
  let fixture: ComponentFixture<ColumnRiskPanelComponent>;

  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let pollServiceSpy: jasmine.SpyObj<PollService>;
  let evaluationDetailsServiceSpy: jasmine.SpyObj<EvaluationDetailsService>;
  let featureFlagsSpy: jasmine.SpyObj<FeatureFlagsService>;

  const mockQuestionQ1 = {
    question: 'Q1',
    position: 1,
    averageRisk: 2,
  } as unknown as PollAvgQuestion;
  const mockQuestionQ2 = {
    question: 'Q2',
    position: 2,
    averageRisk: 1,
  } as unknown as PollAvgQuestion;

  const mockData: ColumnRiskPanelData = {
    cohortIds: [1, 2],
    pollUuid: 'poll-123',
    componentName: 'ansiedad' as ComponentValueType,
    title: 'Risk Panel Test',
    questions: [mockQuestionQ1],
    evaluationId: 5,
  };

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
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

    pollServiceSpy.getVariablesByComponents.and.returnValue(
      of([] as unknown as VariablesResponse)
    );

    evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
      of({
        items: [],
        count: 0,
      } as unknown as GetStudentsResponse)
    );

    await TestBed.configureTestingModule({
      imports: [ColumnRiskPanelComponent],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: PollService, useValue: pollServiceSpy },
        {
          provide: EvaluationDetailsService,
          useValue: evaluationDetailsServiceSpy,
        },
        { provide: FeatureFlagsService, useValue: featureFlagsSpy },
        provideNoopAnimations(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ColumnRiskPanelComponent, {
        set: { template: '' }, // Aísla la prueba unitaria evitando bucles de componentes hijos
      })
      .compileComponents();

    fixture = TestBed.createComponent(ColumnRiskPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization (ngOnChanges & effect)', () => {
    it('should reset cache, preload variables and set variablesCacheReady to true', () => {
      spyOn(component, 'loadStudentList');
      pollServiceSpy.getVariablesByComponents.and.returnValue(
        of([
          { id: 10, name: 'Q1', position: 1 },
        ] as unknown as VariablesResponse)
      );

      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();

      expect(pollServiceSpy.getVariablesByComponents).toHaveBeenCalledWith(
        'poll-123',
        ['ansiedad'],
        true
      );
      expect(component.variablesCache.get('Q1__1')).toBe(10);
      expect(component.variablesCacheReady()).toBeTrue();
    });

    it('should call loadStudentList automatically via effect when variablesCacheReady is true', () => {
      spyOn(component, 'loadStudentList');
      pollServiceSpy.getVariablesByComponents.and.returnValue(
        of([
          { id: 10, name: 'Q1', position: 1 },
        ] as unknown as VariablesResponse)
      );

      fixture.componentRef.setInput('data', mockData);
      fixture.detectChanges();

      expect(component.loadStudentList).toHaveBeenCalledWith(
        mockData.questions[0],
        10
      );
    });

    it('should do nothing if data is null', () => {
      fixture.componentRef.setInput('data', null);
      fixture.detectChanges();

      expect(pollServiceSpy.getVariablesByComponents).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should emit closed event', () => {
      spyOn(component.closed, 'emit');
      component.close();
      expect(component.closed.emit).toHaveBeenCalled();
    });
  });

  describe('loadStudentList', () => {
    it('should return early if variableId is 0 or data is null', () => {
      fixture.componentRef.setInput('data', null);
      component.loadStudentList({} as unknown as PollAvgQuestion, 10);
      expect(
        evaluationDetailsServiceSpy.getStudentsByFilters
      ).not.toHaveBeenCalled();

      fixture.componentRef.setInput('data', mockData);
      component.loadStudentList({} as unknown as PollAvgQuestion, 0);
      expect(
        evaluationDetailsServiceSpy.getStudentsByFilters
      ).not.toHaveBeenCalled();
    });

    it('should load students and sort them by riskLevel desc and answerText asc', () => {
      fixture.componentRef.setInput('data', mockData);

      const unsortedMockStudents = [
        { id: 1, riskLevel: 1, answerText: 'B' },
        { id: 2, riskLevel: 2, answerText: 'C' },
        { id: 3, riskLevel: 2, answerText: 'A' },
      ] as unknown as EvaluationDetailsStudentResponse[];

      evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
        of({
          items: unsortedMockStudents,
          count: 3,
        } as unknown as GetStudentsResponse)
      );

      component.loadStudentList(mockQuestionQ1, 10);

      const storedData = component.riskStudentData().get(1);
      expect(storedData).toBeDefined();
      expect(storedData?.total).toBe(3);

      expect(storedData?.items[0].id).toBe(3); // riskLevel 2, 'A'
      expect(storedData?.items[1].id).toBe(2); // riskLevel 2, 'C'
      expect(storedData?.items[2].id).toBe(1); // riskLevel 1, 'B'
    });
  });

  describe('handleLoadCalled', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('data', mockData);
    });

    it('should return early if variables cache is not ready', () => {
      spyOn(component, 'loadStudentList');
      component.variablesCacheReady.set(false);

      component.handleLoadCalled({ page: 2, pageSize: 5 }, mockQuestionQ1);

      expect(component.pagination).toEqual({ page: 2, pageSize: 5 });
      expect(component.loadStudentList).not.toHaveBeenCalled();
    });

    it('should return early if variableId is undefined in cache', () => {
      spyOn(component, 'loadStudentList');
      component.variablesCacheReady.set(true);

      component.handleLoadCalled({ page: 1, pageSize: 10 }, mockQuestionQ2);

      expect(component.loadStudentList).not.toHaveBeenCalled();
    });

    it('should call loadStudentList if cache is ready and variable exists', () => {
      spyOn(component, 'loadStudentList');
      component.variablesCacheReady.set(true);
      component.variablesCache.set('Q1__1', 10);

      component.handleLoadCalled({ page: 2, pageSize: 5 }, mockQuestionQ1);

      expect(component.loadStudentList).toHaveBeenCalledWith(
        mockQuestionQ1,
        10
      );
    });
  });

  describe('Actions handling', () => {
    it('should do nothing if action id is unknown in handleActionCalled', () => {
      spyOn(component, 'openStudentDetails');

      const event = {
        data: { id: 'unknown_action' },
        item: { id: 99 },
      } as unknown as EventAction;
      component.handleActionCalled(event);

      expect(component.openStudentDetails).not.toHaveBeenCalled();
    });

    it('should call openStudentDetails when action id is openStudentDetails', () => {
      spyOn(component, 'openStudentDetails');

      const event = {
        data: { id: 'openStudentDetails' },
        item: { id: 99 },
      } as unknown as EventAction;
      component.handleActionCalled(event);

      expect(component.openStudentDetails).toHaveBeenCalledWith(99);
    });
  });

  describe('openStudentDetails', () => {
    it('should open ModalStudentDetailV2Component if feature flag is enabled', () => {
      featureFlagsSpy.isEnabled
        .withArgs(FEATURE_FLAGS.studentDetails)
        .and.returnValue(true);

      component.openStudentDetails(100);

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ModalStudentDetailV2Component,
        jasmine.objectContaining({
          data: { studentId: 100 },
        })
      );
    });

    it('should open ModalStudentDetailComponent if feature flag is disabled', () => {
      featureFlagsSpy.isEnabled
        .withArgs(FEATURE_FLAGS.studentDetails)
        .and.returnValue(false);

      component.openStudentDetails(100);

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ModalStudentDetailComponent,
        jasmine.objectContaining({
          data: { studentId: 100 },
        })
      );
    });
  });
});
