import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { signal } from '@angular/core';
import { ViewportService } from '@core/services/layout/viewport.service';
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
import { getRiskColor, getRiskTextColor } from '@core/constants/riskLevel';
import { PagedResult } from '@core/services/interfaces/page.type';

interface VariableItem {
  id: number;
  name: string;
  position: number;
}

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

  const mockVariable: VariableItem = {
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

    const variablesResult: Observable<VariableItem[]> = of([mockVariable]);
    pollServiceSpy.getVariablesByComponents.and.returnValue(
      variablesResult as unknown as ReturnType<
        typeof pollServiceSpy.getVariablesByComponents
      >
    );

    const studentsResult: Observable<
      PagedResult<EvaluationDetailsStudentResponse>
    > = of({
      items: mockStudents,
      count: mockStudents.length,
    });
    evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
      studentsResult as unknown as ReturnType<
        typeof evaluationDetailsServiceSpy.getStudentsByFilters
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

  it('should fall back to an empty studentList when the response has no items', () => {
    const emptyResult: Observable<
      PagedResult<EvaluationDetailsStudentResponse>
    > = of({
      items: undefined as unknown as EvaluationDetailsStudentResponse[],
      count: undefined as unknown as number,
    });
    evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
      emptyResult as unknown as ReturnType<
        typeof evaluationDetailsServiceSpy.getStudentsByFilters
      >
    );
    fixture.componentRef.setInput('data', mockPanelData);
    fixture.detectChanges();

    expect(component.studentList()).toEqual([]);
  });

  it('should fall back totalStudentRisks to items.length when count is missing', () => {
    const partialResult: Observable<
      PagedResult<EvaluationDetailsStudentResponse>
    > = of({
      items: mockStudents,
      count: undefined as unknown as number,
    });
    evaluationDetailsServiceSpy.getStudentsByFilters.and.returnValue(
      partialResult as unknown as ReturnType<
        typeof evaluationDetailsServiceSpy.getStudentsByFilters
      >
    );
    fixture.componentRef.setInput('data', mockPanelData);
    fixture.detectChanges();

    expect(component.totalStudentRisks()).toBe(mockStudents.length);
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
    const otherVariableResult: Observable<VariableItem[]> = of([
      { id: 1, name: 'other question', position: 5 },
    ]);
    pollServiceSpy.getVariablesByComponents.and.returnValue(
      otherVariableResult as unknown as ReturnType<
        typeof pollServiceSpy.getVariablesByComponents
      >
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

  it('should return the color matching getRiskColor for a given risk level', () => {
    expect(component.getRiskColor(3)).toBe(getRiskColor(3));
  });

  it('should return the text color matching getRiskTextColor for a given risk level', () => {
    expect(component.getTextRiskColor(3)).toBe(getRiskTextColor(3));
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

describe('DetailsPanelComponent on a mobile screen', () => {
  let fixture: ComponentFixture<DetailsPanelComponent>;

  const panelData = {
    cohortId: '1',
    pollUuid: 'poll-uuid',
    componentName: 'ACADEMIC' as ComponentValueType,
    question: {
      question: 'How are you feeling?',
      position: 1,
      averageAnswer: '3',
      averageRisk: 2,
      answersDetails: [],
    } as unknown as PollAvgQuestion,
    riskLevel: 2,
    evaluationId: 10,
  } as DetailsPanelData;

  const render = async (
    mobile: boolean,
    students: EvaluationDetailsStudentResponse[] = [
      {
        id: 1,
        name: 'Ana Torres',
        answerText: 'I feel good most of the days of the week',
        riskLevel: 2,
      } as unknown as EvaluationDetailsStudentResponse,
    ]
  ) => {
    const pollService = jasmine.createSpyObj<PollService>('PollService', [
      'getVariablesByComponents',
    ]);
    pollService.getVariablesByComponents.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DetailsPanelComponent],
      providers: [
        provideAnimations(),
        { provide: ActivatedRoute, useValue: {} },
        { provide: PollService, useValue: pollService },
        {
          provide: EvaluationDetailsService,
          useValue: jasmine.createSpyObj('EvaluationDetailsService', [
            'getStudentsByFilters',
          ]),
        },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('MatDialog', ['open']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj('FeatureFlagsService', ['isEnabled']),
        },
        {
          provide: ViewportService,
          useValue: {
            isMobile: signal(mobile),
            renderAsDesktop: signal(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsPanelComponent);
    document.body.appendChild(fixture.nativeElement);
    Object.assign((fixture.nativeElement as HTMLElement).style, {
      display: 'block',
      width: '375px',
    });
    fixture.componentRef.setInput('data', panelData);
    fixture.detectChanges();
    fixture.componentInstance.studentList.set(students);
    fixture.componentInstance.totalStudentRisks.set(students.length);
    fixture.detectChanges();
  };

  afterEach(() => fixture.nativeElement.remove());

  it('[674-improve-reports-charts-mobile-view/AC-13] keeps the student list of the details inside the screen on mobile', async () => {
    await render(true);

    const host = fixture.nativeElement as HTMLElement;
    const card = host.querySelector<HTMLElement>(
      'app-mat-card-details mat-card'
    )!;
    const cardRect = card.getBoundingClientRect();

    expect(card.textContent).toContain('Ana Torres');
    expect(cardRect.right).toBeLessThanOrEqual(
      host.getBoundingClientRect().right + 1
    );
    Array.from(card.querySelectorAll<HTMLElement>('*')).forEach(element => {
      expect(element.getBoundingClientRect().right).toBeLessThanOrEqual(
        cardRect.right + 1
      );
    });
    expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
  });

  it('[674-improve-reports-charts-mobile-view/AC-28] aligns the risk badge and the action of every student card on mobile whatever the text length', async () => {
    await render(true, [
      {
        id: 1,
        name: 'Ana',
        answerText: 'Yes',
        riskLevel: 2,
      },
      {
        id: 2,
        name: 'Carlos Alberto Fernandez de la Torre Santillana',
        answerText: 'Ninguna de las anteriores ni las opciones restantes',
        riskLevel: 4,
      },
    ] as unknown as EvaluationDetailsStudentResponse[]);

    const cards = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'app-mat-card-details mat-card'
      )
    );
    const parts = cards.map(card => ({
      badge: card
        .querySelector<HTMLElement>('.row-mobile.badge')!
        .getBoundingClientRect(),
      action: card
        .querySelector<HTMLElement>('mat-card-actions')!
        .getBoundingClientRect(),
    }));

    expect(cards.length).toBe(2);
    expect(Math.abs(parts[0].badge.left - parts[1].badge.left)).toBeLessThan(1);
    expect(Math.abs(parts[0].badge.width - parts[1].badge.width)).toBeLessThan(
      1
    );
    expect(Math.abs(parts[0].action.left - parts[1].action.left)).toBeLessThan(
      1
    );
    parts.forEach(part => {
      expect(part.action.top).toBeLessThan(part.badge.bottom);
    });
  });
});
