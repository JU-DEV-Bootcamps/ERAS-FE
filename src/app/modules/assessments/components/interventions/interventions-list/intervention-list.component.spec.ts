import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  InterventionListComponent,
  InterventionRowViewModel,
} from './intervention-list.component';
import { AssessmentService } from '@core/services/api/assessement.service';
import { InterventionService } from '@core/services/api/intervention.service';
import { InterventionFilterStrategy } from '@shared/components/list-filters/strategies/interventions.strategy';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StudentProfileData } from '../../assessment-list/assessment-student-data/assessment-student-data.component';
import {
  AssessmentModel,
  AssessmentStatus,
  InterventionMode,
  InterventionModel,
  InterventionType,
  RiskLevels,
} from '@core/models/assessment.model';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

describe('InterventionListComponent', () => {
  let component: InterventionListComponent;
  let fixture: ComponentFixture<InterventionListComponent>;
  let mockAssessmentService: jasmine.SpyObj<AssessmentService>;
  let mockInterventionService: jasmine.SpyObj<InterventionService>;
  let mockFilterStrategy: jasmine.SpyObj<InterventionFilterStrategy>;

  const intervention: InterventionModel = {
    id: 1,
    assessmentId: 10,
    comments: 'Test comment',
    studentIds: [1],
    kind: InterventionType.Individual,
    mode: InterventionMode.InPlace,
    dateUtc: '2026-02-20',
  } as InterventionModel;

  const assessment: AssessmentModel = {
    id: 10,
    status: AssessmentStatus.Remitted,
  } as AssessmentModel;

  const studentLookup: Record<string, StudentProfileData> = {
    '1': {
      id: 1,
      name: 'Abby',
      email: 'aby@mail.com',
    } as StudentProfileData,
  };

  beforeEach(async () => {
    mockAssessmentService = jasmine.createSpyObj('AssessmentService', [
      'getById',
    ]);
    mockInterventionService = jasmine.createSpyObj('InterventionService', [
      'getByAssessment',
    ]);
    mockFilterStrategy = jasmine.createSpyObj('InterventionFilterStrategy', [
      'apply',
    ]);

    await TestBed.configureTestingModule({
      imports: [InterventionListComponent],
      providers: [
        { provide: AssessmentService, useValue: mockAssessmentService },
        { provide: InterventionService, useValue: mockInterventionService },
        { provide: InterventionFilterStrategy, useValue: mockFilterStrategy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InterventionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load interventions and assessment when assessmentIdInput is set', () => {
    mockInterventionService.getByAssessment.and.returnValue(of([]));
    mockAssessmentService.getById.and.returnValue(of(assessment));
    mockFilterStrategy.apply.and.returnValue([]);

    spyOn(component, 'loadInterventions');
    component.assessmentIdInput = 10;
    expect(component.assessmentId()).toBe(10);
    expect(component.loadInterventions).toHaveBeenCalledWith(10);
  });

  it('should clear data when assessmentIdInput is null', () => {
    component['interventions'].set([
      {
        studentDisplay: '',
        commentPreview: '',
        assessmentId: 0,
        kind: InterventionType.Individual,
        mode: InterventionMode.InPlace,
        dateUtc: '',
        studentIds: [],
      },
    ]);
    component['assessment'].set(assessment);
    component.assessmentIdInput = null;

    expect(component['interventions']()).toEqual([]);
    expect(component['assessment']()).toBeNull();
  });

  it('should load interventions', () => {
    component.studentNamesLookup = studentLookup;
    mockInterventionService.getByAssessment.and.returnValue(of([intervention]));
    mockFilterStrategy.apply.and.callFake(items => items);
    component.loadInterventions(10);

    expect(mockInterventionService.getByAssessment).toHaveBeenCalledWith(10);
    expect(component['isLoading']()).toBeFalse();
    expect(component['hasInterventions']()).toBeTrue();
    expect(component['interventions']().length).toBe(1);
  });

  it('should handle intervention load error', () => {
    mockInterventionService.getByAssessment.and.returnValue(
      throwError(() => new Error('error'))
    );
    spyOn(console, 'error');
    component.loadInterventions(10);
    expect(console.error).toHaveBeenCalled();
    expect(component['interventions']()).toEqual([]);
    expect(component['isLoading']()).toBeFalse();
  });

  it('should refresh selected intervention after reload', () => {
    component.studentNamesLookup = studentLookup;
    const updated = {
      ...intervention,
      comments: 'Updated',
    };
    mockInterventionService.getByAssessment.and.returnValue(of([updated]));
    component['selectedIntervention'].set({
      ...updated,
      studentDisplay: [],
      commentPreview: '',
    });
    component.loadInterventions(10);
    expect(component['selectedIntervention']()?.comments).toBe('Updated');
  });

  it('should load assessment', () => {
    mockAssessmentService.getById.and.returnValue(of(assessment));
    component['loadAssessment'](10);
    expect(mockAssessmentService.getById).toHaveBeenCalledWith('10');
    expect(component['assessment']()).toEqual(assessment);
    expect(component['isLoadingAssessment']()).toBeFalse();
  });

  it('should handle assessment load error', () => {
    mockAssessmentService.getById.and.returnValue(
      throwError(() => new Error())
    );
    spyOn(console, 'error');
    component['loadAssessment'](10);
    expect(console.error).toHaveBeenCalled();
    expect(component['assessment']()).toBeNull();
    expect(component['isLoadingAssessment']()).toBeFalse();
  });

  it('should return true when assessment is finalized', () => {
    component['assessment'].set({
      status: 'Finalized',
    } as AssessmentModel);
    expect(component.statusFinalizedAssessment).toBeTrue();
  });

  it('should return false when assessment is not finalized', () => {
    component['assessment'].set({
      status: AssessmentStatus.Remitted,
    } as AssessmentModel);
    expect(component.statusFinalizedAssessment).toBeFalse();
  });

  it('should emit create event', () => {
    spyOn(component.createClicked, 'emit');
    component['onCreateClick']();
    expect(component.createClicked.emit).toHaveBeenCalled();
  });

  it('should emit edit event', () => {
    spyOn(component.editClicked, 'emit');
    component['onEditClick'](intervention);
    expect(component.editClicked.emit).toHaveBeenCalledWith(intervention);
  });

  it('should emit delete event', () => {
    spyOn(component.deleteClicked, 'emit');
    component['onDeleteClick'](intervention);
    expect(component.deleteClicked.emit).toHaveBeenCalledWith(intervention);
  });

  it('should select intervention on view click', () => {
    const row = {
      ...intervention,
      studentDisplay: [],
      commentPreview: '',
    };
    component['onViewClick'](row);
    expect(component['selectedIntervention']()).toEqual(row);
  });

  it('should close detail panel', () => {
    component['selectedIntervention'].set({
      studentDisplay: '',
      commentPreview: '',
      assessmentId: 0,
      kind: InterventionType.Individual,
      mode: InterventionMode.InPlace,
      dateUtc: '',
      studentIds: [],
    });
    component['closeDetailPanel']();
    expect(component['selectedIntervention']()).toBeNull();
  });

  it('should update page index', () => {
    component['onPageChange']({
      pageIndex: 2,
      pageSize: 10,
    } as PageEvent);
    expect(component['pageIndex']()).toBe(2);
  });

  it('should use filter strategy', () => {
    component.studentNamesLookup = studentLookup;
    component['interventions'].set([
      {
        ...intervention,
        studentDisplay: [],
        commentPreview: '',
      },
    ]);
    mockFilterStrategy.apply.and.returnValue(component['interventions']());
    component['filteredInterventions']();
    expect(mockFilterStrategy.apply).toHaveBeenCalledWith(
      component['interventions'](),
      component.appliedFilters()
    );
  });

  it('should truncate long comments', () => {
    const longComment = 'a'.repeat(100);
    mockInterventionService.getByAssessment.and.returnValue(
      of([
        {
          ...intervention,
          comments: longComment,
        },
      ])
    );
    component.loadInterventions(10);
    expect(
      component['interventions']()[0].commentPreview.endsWith('...')
    ).toBeTrue();
  });

  it('should show dash when comments are empty', () => {
    mockInterventionService.getByAssessment.and.returnValue(
      of([
        {
          ...intervention,
          comments: '',
        },
      ])
    );
    component.loadInterventions(10);
    expect(component['interventions']()[0].commentPreview).toBe('—');
  });

  describe('sorting behavior', () => {
    const highRisk = {
      ...intervention,
      id: 1,
      dateUtc: '2026-02-20',
      riskLevelName: RiskLevels.High,
      studentDisplay: [],
      commentPreview: '',
    } as unknown as InterventionRowViewModel;

    const mediumRisk = {
      ...intervention,
      id: 2,
      dateUtc: '2026-03-01',
      riskLevelName: RiskLevels.Medium,
      studentDisplay: [],
      commentPreview: '',
    } as unknown as InterventionRowViewModel;

    const lowRisk = {
      ...intervention,
      id: 3,
      dateUtc: '2026-01-10',
      riskLevelName: RiskLevels.Low,
      studentDisplay: [],
      commentPreview: '',
    } as unknown as InterventionRowViewModel;

    describe('onSortClick', () => {
      it('should set the new column and reset direction to "asc" when a different column is clicked', () => {
        component['onSortClick']('risk');
        expect(component['sortColumn']()).toBe('risk');
        expect(component['sortDirection']()).toBe('asc');
      });

      it('should toggle direction when the same column is clicked again', () => {
        component['onSortClick']('risk');
        expect(component['sortDirection']()).toBe('asc');

        component['onSortClick']('risk');
        expect(component['sortDirection']()).toBe('desc');

        component['onSortClick']('risk');
        expect(component['sortDirection']()).toBe('asc');
      });

      it('should reset pageIndex to 0 when sorting changes', () => {
        component['pageIndex'].set(2);
        component['onSortClick']('risk');
        expect(component['pageIndex']()).toBe(0);
      });
    });

    describe('compareByColumn', () => {
      it('should rank "high" above "medium" and "low" for the risk column', () => {
        const result = component['compareByColumn'](
          highRisk,
          mediumRisk,
          'risk'
        );
        expect(result).toBeGreaterThan(0);
      });

      it('should rank "low" below "medium" for the risk column', () => {
        const result = component['compareByColumn'](
          lowRisk,
          mediumRisk,
          'risk'
        );
        expect(result).toBeLessThan(0);
      });

      it('should return 0 when comparing equal risk levels', () => {
        const anotherHigh = { ...highRisk, id: 4 };
        const result = component['compareByColumn'](
          highRisk,
          anotherHigh,
          'risk'
        );
        expect(result).toBe(0);
      });

      it('should fall back to string comparison for unknown columns', () => {
        const itemA = {
          ...highRisk,
          activity: 'Aaa',
        } as unknown as InterventionRowViewModel;
        const itemB = {
          ...mediumRisk,
          activity: 'Bbb',
        } as unknown as InterventionRowViewModel;
        const result = component['compareByColumn'](itemA, itemB, 'activity');
        expect(result).toBe(0);
      });
    });

    describe('sortedInterventions', () => {
      beforeEach(() => {
        component.studentNamesLookup = studentLookup;
        mockFilterStrategy.apply.and.callFake(items => items);
      });

      it('should sort by risk level when sortColumn is "risk"', () => {
        mockInterventionService.getByAssessment.and.returnValue(
          of([
            { ...intervention, id: 1, riskLevelName: RiskLevels.Low },
            { ...intervention, id: 2, riskLevelName: RiskLevels.High },
            { ...intervention, id: 3, riskLevelName: RiskLevels.Medium },
          ])
        );
        component.loadInterventions(10);
        component['onSortClick']('risk');
        const result = component['sortedInterventions']();
        expect(result.map(r => r.id)).toEqual([1, 3, 2]);
      });

      it('should reverse order when direction toggles to desc', () => {
        mockInterventionService.getByAssessment.and.returnValue(
          of([
            { ...intervention, id: 1, riskLevelName: RiskLevels.Low },
            { ...intervention, id: 2, riskLevelName: RiskLevels.High },
            { ...intervention, id: 3, riskLevelName: RiskLevels.Medium },
          ])
        );
        component.loadInterventions(10);
        component['onSortClick']('risk');
        component['onSortClick']('risk');

        const result = component['sortedInterventions']();
        expect(result.map(r => r.id)).toEqual([2, 3, 1]);
      });

      it('should not mutate the original filteredInterventions array', () => {
        mockInterventionService.getByAssessment.and.returnValue(
          of([
            { ...intervention, id: 1, dateUtc: '2026-01-10' },
            { ...intervention, id: 2, dateUtc: '2026-03-01' },
          ])
        );
        component.loadInterventions(10);

        const before = component['filteredInterventions']();
        const beforeOrder = before.map(r => r.id);

        component['sortedInterventions']();

        const after = component['filteredInterventions']();
        expect(after.map(r => r.id)).toEqual(beforeOrder);
      });
    });
  });
});
