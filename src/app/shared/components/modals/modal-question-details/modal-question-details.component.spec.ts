import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import {
  ModalQuestionDetailsComponent,
  SelectedHMData,
} from './modal-question-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { PollAvgQuestion, PollCountQuestion } from '@core/models/summary.model';
import { ReportService } from '@core/services/api/report.service';
import { PollService } from '@core/services/api/poll.service';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { ModalStudentDetailComponent } from '../modal-student-detail/modal-student-detail.component';
import { ModalStudentDetailV2Component } from '../modal-student-detail/v2/modal-student-detail-v2.component';
import { EventAction, EventLoad } from '@core/models/load';
import { PagedResult } from '@core/services/interfaces/page.type';
import { VariableModel } from '@core/models/variable.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ModalQuestionDetailsComponent', () => {
  let component: ModalQuestionDetailsComponent;
  let fixture: ComponentFixture<ModalQuestionDetailsComponent>;
  let pollServiceSpy: jasmine.SpyObj<PollService>;
  let evaluationDetailsServiceSpy: jasmine.SpyObj<EvaluationDetailsService>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogRefSpy: { close: jasmine.Spy; updateSize: jasmine.Spy };

  const mockQuestion: PollAvgQuestion = {
    question: 'Test Question',
    averageRisk: 3,
    averageAnswer: 'Test Answer',
    position: 1,
    answersDetails: [
      {
        answerText: 'Test answer',
        answerPercentage: 100,
        studentsEmails: ['test@test.com'],
      },
    ],
  };

  const mockDialogData: SelectedHMData = {
    cohortId: '1,2',
    pollUuid: 'test-uuid',
    componentName: 'FAMILIAR' as ComponentValueType,
    text: 'Test Component',
    question: mockQuestion,
  };

  beforeEach(async () => {
    pollServiceSpy = jasmine.createSpyObj('PollService', [
      'getVariablesByComponents',
    ]);
    evaluationDetailsServiceSpy = jasmine.createSpyObj(
      'EvaluationDetailsService',
      ['getStudentsByFilters']
    );
    featureFlagsServiceSpy = jasmine.createSpyObj('FeatureFlagsService', [
      'isEnabled',
    ]);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRefSpy = {
      close: jasmine.createSpy('close'),
      updateSize: jasmine.createSpy('updateSize'),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ModalQuestionDetailsComponent,
        NoopAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: ReportService,
          useValue: jasmine.createSpyObj('ReportService', ['getTopPollReport']),
        },
        { provide: PollService, useValue: pollServiceSpy },
        {
          provide: EvaluationDetailsService,
          useValue: evaluationDetailsServiceSpy,
        },
        { provide: FeatureFlagsService, useValue: featureFlagsServiceSpy },
      ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(ModalQuestionDetailsComponent);
    component = fixture.componentInstance;

    dialogSpy = spyOn(
      component.dialog,
      'open'
    ) as unknown as jasmine.SpyObj<MatDialog>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the injected dialog data', () => {
    expect(component.inputQuestion).toEqual(mockDialogData);
  });

  describe('ngAfterViewInit', () => {
    it('should call dialogRef.updateSize("auto") after the timeout', fakeAsync(() => {
      component.ngAfterViewInit();
      tick();

      expect(dialogRefSpy.updateSize).toHaveBeenCalledWith('auto');
    }));
  });

  describe('onClose', () => {
    it('should close the dialog', () => {
      component.onClose();

      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  describe('loadComponentsAndVariables', () => {
    it('should set variableId and load students when a matching variable is found', () => {
      pollServiceSpy.getVariablesByComponents.and.returnValue(
        of([
          { id: 99, name: 'Other Question', position: 2 },
          {
            id: 42,
            name: mockQuestion.question,
            position: mockQuestion.position,
          },
        ] as unknown as VariableModel[])
      );
      const loadStudentsSpy = spyOn(component, 'loadStudents');

      component.loadComponentsAndVariables();

      expect(pollServiceSpy.getVariablesByComponents).toHaveBeenCalledWith(
        mockDialogData.pollUuid,
        [mockDialogData.componentName.toLowerCase()],
        true
      );
      expect(component.variableId).toBe(42);
      expect(loadStudentsSpy).toHaveBeenCalled();
    });

    it('should not update variableId or load students when no variable matches', () => {
      pollServiceSpy.getVariablesByComponents.and.returnValue(
        of([
          { id: 99, name: 'Other Question', position: 2 },
        ] as unknown as VariableModel[])
      );
      const loadStudentsSpy = spyOn(component, 'loadStudents');

      component.loadComponentsAndVariables();

      expect(component.variableId).toBe(0);
      expect(loadStudentsSpy).not.toHaveBeenCalled();
    });
  });

  describe('loadStudents', () => {
    it('should sort students by riskLevel descending, then answerText ascending', () => {
      const items = [
        { id: 1, riskLevel: 2, answerText: 'B student' },
        { id: 2, riskLevel: 3, answerText: 'A student' },
        { id: 3, riskLevel: 3, answerText: 'C student' },
      ] as EvaluationDetailsStudentResponse[];

      evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
        of({
          items,
          count: 3,
        } as unknown as PagedResult<EvaluationDetailsStudentResponse>)
      );

      component.loadStudents();

      expect(component.studentList().map(s => s.id)).toEqual([2, 3, 1]);
      expect(component.totalStudentRisks()).toBe(3);
    });

    it('should default to items.length when count is not provided', () => {
      const items = [
        { id: 1, riskLevel: 1, answerText: 'A' },
      ] as EvaluationDetailsStudentResponse[];

      evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
        of({
          items,
        } as unknown as PagedResult<EvaluationDetailsStudentResponse>)
      );

      component.loadStudents();

      expect(component.totalStudentRisks()).toBe(1);
    });

    it('should default to an empty list when items is missing', () => {
      evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
        of({} as unknown as PagedResult<EvaluationDetailsStudentResponse>)
      );

      component.loadStudents();

      expect(component.studentList()).toEqual([]);
      expect(component.totalStudentRisks()).toBe(0);
    });

    it('should pass riskLevel as a single-item array when set, and undefined when not set', () => {
      evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
        of({
          items: [],
        } as unknown as PagedResult<EvaluationDetailsStudentResponse>)
      );

      component.inputQuestion = { ...mockDialogData, riskLevel: 4 };
      component.loadStudents();

      expect(
        evaluationDetailsServiceSpy.getStudentsByFilters
      ).toHaveBeenCalledWith(
        mockDialogData.pollUuid,
        [mockDialogData.componentName.toLowerCase()],
        [1, 2],
        [component.variableId],
        component.pagination.pageSize,
        component.pagination.page,
        [4],
        undefined
      );
    });
  });

  describe('getRiskColor / getTextRiskColor', () => {
    it('should return a defined color for known risk levels', () => {
      expect(component.getRiskColor(1)).toBeTruthy();
      expect(component.getTextRiskColor(1)).toBeTruthy();
    });
  });

  describe('openStudentDetails', () => {
    it('should open ModalStudentDetailV2Component when the feature flag is enabled', () => {
      featureFlagsServiceSpy.isEnabled.and.returnValue(true);

      component.openStudentDetails(7);

      expect(featureFlagsServiceSpy.isEnabled).toHaveBeenCalledWith(
        FEATURE_FLAGS.studentDetails
      );
      expect(dialogSpy).toHaveBeenCalledWith(
        ModalStudentDetailV2Component,
        jasmine.objectContaining({ data: { studentId: 7 } })
      );
    });

    it('should open ModalStudentDetailComponent when the feature flag is disabled', () => {
      featureFlagsServiceSpy.isEnabled.and.returnValue(false);

      component.openStudentDetails(7);

      expect(dialogSpy).toHaveBeenCalledWith(
        ModalStudentDetailComponent,
        jasmine.objectContaining({ data: { studentId: 7 } })
      );
    });
  });

  describe('isPollAvgQuestion', () => {
    it('should return true for a PollAvgQuestion', () => {
      expect(component.isPollAvgQuestion(mockQuestion)).toBeTruthy();
    });

    it('should return false for a PollCountQuestion', () => {
      const countQuestion = { question: 'Q', position: 1 } as PollCountQuestion;

      expect(component.isPollAvgQuestion(countQuestion)).toBeFalsy();
    });
  });

  describe('handleLoadCalled', () => {
    it('should update pagination and reload data', () => {
      const loadSpy = spyOn(component, 'loadComponentsAndVariables');
      const event: EventLoad = { page: 2, pageSize: 25 };

      component.handleLoadCalled(event);

      expect(component.pagination).toEqual({ page: 2, pageSize: 25 });
      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('handleActionCalled', () => {
    it('should call openStudentDetails for the "openStudentDetails" action', () => {
      const openSpy = spyOn(component, 'openStudentDetails');
      const event: EventAction = {
        data: { id: 'openStudentDetails' },
        item: { id: 55 },
      } as never;

      component.handleActionCalled(event);

      expect(openSpy).toHaveBeenCalledWith(55);
    });

    it('should do nothing for an unrecognized action id', () => {
      const openSpy = spyOn(component, 'openStudentDetails');
      const event: EventAction = {
        data: { id: 'unknownAction' },
        item: { id: 55 },
      } as never;

      component.handleActionCalled(event);

      expect(openSpy).not.toHaveBeenCalled();
    });
  });
});
