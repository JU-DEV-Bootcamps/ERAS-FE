import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import {
  DetailsPanelComponent,
  DetailsPanelData,
} from './details-panel.component';
import { PollService } from '@core/services/api/poll.service';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { FEATURE_FLAGS } from '@core/components/feature-flags/feature-flags';
import { ModalStudentDetailComponent } from '@shared/components/modals/modal-student-detail/modal-student-detail.component';
import { ModalStudentDetailV2Component } from '@shared/components/modals/modal-student-detail/v2/modal-student-detail-v2.component';
import { EventAction, EventLoad } from '@core/models/load';
import { EvaluationDetailsStudentResponse } from '@core/models/evaluation-details-student.model';
import { PollAvgQuestion } from '@core/models/summary.model';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';

describe('DetailsPanelComponent', () => {
  let component: DetailsPanelComponent;
  let fixture: ComponentFixture<DetailsPanelComponent>;
  let pollServiceSpy: jasmine.SpyObj<PollService>;
  let evaluationDetailsServiceSpy: jasmine.SpyObj<EvaluationDetailsService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let featureFlagsSpy: jasmine.SpyObj<FeatureFlagsService>;

  const mockPanelData: DetailsPanelData = {
    cohortId: '1,2',
    pollUuid: 'poll-uuid',
    componentName: 'ACADEMIC' as ComponentValueType,
    question: {
      question: 'How are you feeling?',
      position: 1,
      averageAnswer: '3',
      averageRisk: 2,
      answersDetails: [],
    } as PollAvgQuestion,
    riskLevel: 2,
    evaluationId: 10,
  };

  const mockVariable = {
    id: 99,
    name: 'How are you feeling?',
    position: 1,
  };

  const mockStudents: EvaluationDetailsStudentResponse[] = [
    {
      id: 1,
      name: 'Ana',
      answerText: 'Good',
      riskLevel: 1,
    } as unknown as EvaluationDetailsStudentResponse,
    {
      id: 2,
      name: 'Beto',
      answerText: 'Bad',
      riskLevel: 3,
    } as unknown as EvaluationDetailsStudentResponse,
    {
      id: 3,
      name: 'Caro',
      answerText: 'Ok',
      riskLevel: 3,
    } as unknown as EvaluationDetailsStudentResponse,
  ];

  beforeEach(async () => {
    pollServiceSpy = jasmine.createSpyObj('PollService', [
      'getVariablesByComponents',
    ]);
    evaluationDetailsServiceSpy = jasmine.createSpyObj(
      'EvaluationDetailsService',
      ['getStudentsByFilters']
    );
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    featureFlagsSpy = jasmine.createSpyObj('FeatureFlagsService', [
      'isEnabled',
    ]);

    pollServiceSpy.getVariablesByComponents.and.returnValue(
      of([mockVariable]) as unknown as ReturnType<
        PollService['getVariablesByComponents']
      >
    );
    evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
      of({
        items: mockStudents,
        count: mockStudents.length,
      }) as unknown as ReturnType<
        EvaluationDetailsService['getStudentsByFilters']
      >
    );
    featureFlagsSpy.isEnabled.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [DetailsPanelComponent],
      providers: [
        provideAnimations(),
        { provide: ActivatedRoute, useValue: {} },
        { provide: PollService, useValue: pollServiceSpy },
        {
          provide: EvaluationDetailsService,
          useValue: evaluationDetailsServiceSpy,
        },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: FeatureFlagsService, useValue: featureFlagsSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('data', mockPanelData);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // --- CSV export fix: riskLevel column ---

  it('should include riskLevel in exportColumns so it is exported in CSV/PDF', () => {
    expect(component.exportColumns).toEqual([
      { key: 'riskLevel', label: 'Risk Level' },
    ]);
  });

  it('should not duplicate riskLevel inside the visual columns array', () => {
    const keys = component.columns.map(c => c.key);
    expect(keys).not.toContain('riskLevel');
  });

  it('should keep riskLevel in columnTemplates for the badge render', () => {
    const keys = component.columnTemplates.map(c => c.key);
    expect(keys).toContain('riskLevel');
  });

  // --- data loading ---

  it('should load variables and students when data input changes', () => {
    fixture.componentRef.setInput('data', mockPanelData);
    fixture.detectChanges();

    expect(pollServiceSpy.getVariablesByComponents).toHaveBeenCalledWith(
      mockPanelData.pollUuid,
      [mockPanelData.componentName.toLowerCase()],
      true
    );
    expect(evaluationDetailsServiceSpy.getStudentsByFilters).toHaveBeenCalled();
    expect(component.variableId).toBe(mockVariable.id);
  });

  it('should reset pagination to page 0 when data changes', () => {
    component.pagination = { page: 3, pageSize: 10 };
    fixture.componentRef.setInput('data', mockPanelData);
    fixture.detectChanges();

    expect(component.pagination.page).toBe(0);
  });

  it('should sort students by riskLevel desc, then answerText asc', () => {
    fixture.componentRef.setInput('data', mockPanelData);
    fixture.detectChanges();

    const list = component.studentList();
    expect(list[0].riskLevel).toBe(3);
    expect(list[0].answerText).toBe('Bad');
    expect(list[1].riskLevel).toBe(3);
    expect(list[1].answerText).toBe('Ok');
    expect(list[2].riskLevel).toBe(1);
  });

  it('should set totalStudentRisks from the response count', () => {
    fixture.componentRef.setInput('data', mockPanelData);
    fixture.detectChanges();

    expect(component.totalStudentRisks()).toBe(3);
  });

  it('should not call services when data is null', () => {
    fixture.componentRef.setInput('data', mockPanelData);
    fixture.detectChanges();
    pollServiceSpy.getVariablesByComponents.calls.reset();

    fixture.componentRef.setInput('data', null);
    fixture.detectChanges();

    expect(pollServiceSpy.getVariablesByComponents).not.toHaveBeenCalled();
  });

  it('should skip loading students when no matching variable is found', () => {
    pollServiceSpy.getVariablesByComponents.and.returnValue(
      of([
        { id: 1, name: 'other question', position: 5 },
      ]) as unknown as ReturnType<PollService['getVariablesByComponents']>
    );
    fixture.componentRef.setInput('data', mockPanelData);
    fixture.detectChanges();

    expect(
      evaluationDetailsServiceSpy.getStudentsByFilters
    ).not.toHaveBeenCalled();
  });

  // --- UI helpers ---

  it('should emit closed event when close is called', () => {
    spyOn(component.closed, 'emit');
    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should identify a PollAvgQuestion correctly', () => {
    const avgQuestion = {
      question: 'How are you feeling?',
      position: 1,
      averageAnswer: '3',
      averageRisk: 2,
      answersDetails: [],
    } as PollAvgQuestion;
    expect(component.isPollAvgQuestion(avgQuestion)).toBeTrue();
  });

  it('should identify a non-PollAvgQuestion correctly', () => {
    const countQuestion = {
      count: 3,
    } as unknown as PollAvgQuestion;
    expect(component.isPollAvgQuestion(countQuestion)).toBeFalse();
  });

  // --- modal opening (feature flag branching) ---

  it('should open the V1 modal when the feature flag is disabled', () => {
    featureFlagsSpy.isEnabled.and.returnValue(false);
    component.openStudentDetails(5);

    expect(featureFlagsSpy.isEnabled).toHaveBeenCalledWith(
      FEATURE_FLAGS.studentDetails
    );
    const callArgs = dialogSpy.open.calls.mostRecent().args;
    expect(callArgs[0]).toBe(ModalStudentDetailComponent);
    expect((callArgs[1] as MatDialogConfig)?.data).toEqual({ studentId: 5 });
  });

  it('should open the V2 modal when the feature flag is enabled', () => {
    featureFlagsSpy.isEnabled.and.returnValue(true);
    component.openStudentDetails(7);

    const callArgs = dialogSpy.open.calls.mostRecent().args;
    expect(callArgs[0]).toBe(ModalStudentDetailV2Component);
    expect((callArgs[1] as MatDialogConfig)?.data).toEqual({ studentId: 7 });
  });

  // --- event handlers from app-list-details ---

  it('should update pagination and reload on handleLoadCalled', () => {
    fixture.componentRef.setInput('data', mockPanelData);
    fixture.detectChanges();
    pollServiceSpy.getVariablesByComponents.calls.reset();

    const event: EventLoad = { page: 2, pageSize: 20 };
    component.handleLoadCalled(event);

    expect(component.pagination).toEqual({ page: 2, pageSize: 20 });
    expect(pollServiceSpy.getVariablesByComponents).toHaveBeenCalled();
  });

  it('should dispatch openStudentDetails action from handleActionCalled', () => {
    spyOn(component, 'openStudentDetails');
    const item = {
      id: 42,
      name: 'Ana',
      answerText: 'Good',
      riskLevel: 1,
    } as unknown as EvaluationDetailsStudentResponse;

    const event = {
      data: { id: 'openStudentDetails' },
      item,
    } as unknown as EventAction;

    component.handleActionCalled(event);

    expect(component.openStudentDetails).toHaveBeenCalledWith(42);
  });

  it('should ignore unknown actions from handleActionCalled', () => {
    spyOn(component, 'openStudentDetails');

    const event = {
      data: { id: 'unknownAction' },
      item: {},
    } as unknown as EventAction;

    component.handleActionCalled(event);

    expect(component.openStudentDetails).not.toHaveBeenCalled();
  });
});
