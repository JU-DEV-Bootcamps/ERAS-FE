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
  InterventionStatus,
  InterventionType,
  RiskLevels,
} from '@core/models/assessment.model';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { CsvService } from '@core/services/exports/csv.service';
import { RoleBasedFetchResolver } from '@core/utils/strategies/role-based-fetch-strategy/role-based-fetch.resolver';

describe('InterventionListComponent', () => {
  let component: InterventionListComponent;
  let fixture: ComponentFixture<InterventionListComponent>;
  let mockAssessmentService: jasmine.SpyObj<AssessmentService>;
  let mockInterventionService: jasmine.SpyObj<InterventionService>;
  let mockFilterStrategy: jasmine.SpyObj<InterventionFilterStrategy>;
  let mockCsvService: jasmine.SpyObj<CsvService>;
  let fetchResolverMock: jasmine.SpyObj<RoleBasedFetchResolver>;

  const intervention: InterventionModel = {
    id: 1,
    assessmentId: 10,
    comments: 'Test comment',
    studentIds: [1],
    kind: InterventionType.Individual,
    mode: InterventionMode.InPlace,
    dateUtc: '2026-02-20',
  } as InterventionModel;

  const intervention2: InterventionModel = {
    id: 2,
    assessmentId: 10,
    comments: 'Test comment',
    studentIds: [],
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
    mockCsvService = jasmine.createSpyObj('CsvService', ['exportToCSV']);
    fetchResolverMock = jasmine.createSpyObj('RoleBasedFetchResolver', [
      'resolve',
    ]);
    fetchResolverMock.resolve.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [InterventionListComponent],
      providers: [
        { provide: AssessmentService, useValue: mockAssessmentService },
        { provide: InterventionService, useValue: mockInterventionService },
        { provide: InterventionFilterStrategy, useValue: mockFilterStrategy },
        { provide: CsvService, useValue: mockCsvService },
        { provide: RoleBasedFetchResolver, useValue: fetchResolverMock },
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
    fetchResolverMock.resolve.and.returnValue(of([]));
    mockAssessmentService.getById.and.returnValue(of(assessment));
    mockFilterStrategy.apply.and.returnValue([]);

    spyOn(component, 'loadInterventions');
    component.assessmentIdInput = 10;
    expect(component.assessmentId()).toBe(10);
    expect(component.loadInterventions).toHaveBeenCalledWith(10);
    expect(component['sortColumn']()).toBeNull();
  });

  it('should clear data when assessmentIdInput is null', () => {
    component['interventions'].set([
      {
        id: 1,
        studentDisplay: '',
        commentPreview: '',
        assessmentId: 0,
        kind: InterventionType.Individual,
        mode: InterventionMode.InPlace,
        dateUtc: '',
        studentIds: [],
      } as unknown as InterventionRowViewModel,
    ]);
    component['assessment'].set(assessment);
    component.assessmentIdInput = null;

    expect(component['interventions']()).toEqual([]);
    expect(component['assessment']()).toBeNull();
  });

  describe('loadInterventions', () => {
    it('should load interventions', () => {
      component.studentNamesLookup = studentLookup;
      fetchResolverMock.resolve.and.returnValue(of([intervention]));
      mockFilterStrategy.apply.and.callFake(items => items);
      component.loadInterventions(10);

      expect(component['isLoading']()).toBeFalse();
      expect(component['hasInterventions']()).toBeTrue();
      expect(component['interventions']().length).toBe(1);
    });

    it('should handle intervention load error', () => {
      fetchResolverMock.resolve.and.returnValue(
        throwError(() => new Error('error'))
      );
      spyOn(console, 'error');
      component.loadInterventions(10);
      expect(console.error).toHaveBeenCalled();
      expect(component['interventions']()).toEqual([]);
      expect(component['isLoading']()).toBeFalse();
    });

    it('should refresh selected intervention after reload when found', () => {
      component.studentNamesLookup = studentLookup;
      const updated = {
        ...intervention,
        comments: 'Updated',
      } as InterventionModel;
      fetchResolverMock.resolve.and.returnValue(of([updated]));

      component['selectedIntervention'].set({
        ...updated,
        studentDisplay: [],
        commentPreview: '',
      } as unknown as InterventionRowViewModel);

      component.loadInterventions(10);
      expect(component['selectedIntervention']()?.comments).toBe('Updated');
    });

    it('should set selected intervention to null if not found after reload', () => {
      component.studentNamesLookup = studentLookup;
      fetchResolverMock.resolve.and.returnValue(of([intervention2]));

      component['selectedIntervention'].set({
        id: 99,
        studentDisplay: [],
        commentPreview: '',
      } as unknown as InterventionRowViewModel);

      component.loadInterventions(10);
      expect(component['selectedIntervention']()).toBeNull();
    });
  });

  describe('loadAssessment', () => {
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
  });

  describe('buildCommentPreview branches', () => {
    it('should return a dash when comments are empty, null or whitespace', () => {
      fetchResolverMock.resolve.and.returnValue(
        of([
          { ...intervention, id: 1, comments: '' },
          { ...intervention, id: 2, comments: undefined },
          { ...intervention, id: 3, comments: null },
          { ...intervention, id: 4, comments: '   ' },
        ] as InterventionModel[])
      );
      component.loadInterventions(10);

      expect(component['interventions']()[0].commentPreview).toBe('—');
      expect(component['interventions']()[1].commentPreview).toBe('—');
      expect(component['interventions']()[2].commentPreview).toBe('—');
      expect(component['interventions']()[3].commentPreview).toBe('—');
    });

    it('should truncate comments longer than 60 characters', () => {
      const longComment = 'a'.repeat(100);
      fetchResolverMock.resolve.and.returnValue(
        of([{ ...intervention, comments: longComment }] as InterventionModel[])
      );
      component.loadInterventions(10);

      expect(
        component['interventions']()[0].commentPreview.endsWith('...')
      ).toBeTrue();
      expect(component['interventions']()[0].commentPreview.length).toBe(63);
    });

    it('should return comments verbatim if length is exactly 60 or less', () => {
      const exactComment = 'a'.repeat(60);
      fetchResolverMock.resolve.and.returnValue(
        of([{ ...intervention, comments: exactComment }] as InterventionModel[])
      );
      component.loadInterventions(10);

      expect(component['interventions']()[0].commentPreview).toBe(exactComment);
    });
  });

  describe('buildStudentDisplay branches', () => {
    it('should map student lookup for existing studentIds', () => {
      component.studentNamesLookup = studentLookup;
      fetchResolverMock.resolve.and.returnValue(
        of([{ ...intervention, studentIds: [1] }] as InterventionModel[])
      );
      component.loadInterventions(10);

      expect(component['interventions']()[0].studentDisplay).toEqual([
        studentLookup['1'],
      ]);
    });

    it('should return "No student assigned" when studentIds is empty or undefined', () => {
      fetchResolverMock.resolve.and.returnValue(
        of([
          { ...intervention, id: 1, studentIds: [] },
          { ...intervention, id: 2, studentIds: undefined },
        ] as InterventionModel[])
      );
      component.loadInterventions(10);

      expect(component['interventions']()[0].studentDisplay).toBe(
        'No student assigned'
      );
      expect(component['interventions']()[1].studentDisplay).toBe(
        'No student assigned'
      );
    });
  });

  describe('Events and interactions', () => {
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
      } as unknown as InterventionRowViewModel;
      component['onViewClick'](row);
      expect(component['selectedIntervention']()).toEqual(row);
    });

    it('should close detail panel', () => {
      component['selectedIntervention'].set({} as InterventionRowViewModel);
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
  });

  describe('Labels evaluation', () => {
    it('should resolve activity label', () => {
      const label = component['activityLabel']('Meeting');
      expect(label).toBeDefined();
    });

    it('should resolve area label', () => {
      const label = component['areaLabel']('Academic');
      expect(label).toBeDefined();
    });
  });

  describe('comment previews', () => {
    it('should truncate long comments', () => {
      const longComment = 'a'.repeat(100);
      fetchResolverMock.resolve.and.returnValue(
        of([{ ...intervention, comments: longComment }])
      );
      component.loadInterventions(10);

      const preview = component['interventions']()[0].commentPreview;
      expect(preview.endsWith('...')).toBeTrue();
      expect(preview.length).toBeLessThan(longComment.length);
    });

    it('should show a dash when comments are empty', () => {
      fetchResolverMock.resolve.and.returnValue(
        of([{ ...intervention, comments: '' }])
      );
      component.loadInterventions(10);

      expect(component['interventions']()[0].commentPreview).toBe('—');
    });
  });

  describe('exportToCSV branches', () => {
    beforeEach(() => {
      component.studentNamesLookup = studentLookup;
    });

    it('should not export if isGenerating is true', () => {
      component['isGenerating'].set(true);
      component.exportToCSV();
      expect(mockCsvService.exportToCSV).not.toHaveBeenCalled();
    });

    it('should export interventions with string arrays for students (branch true)', () => {
      component['interventions'].set([
        {
          ...intervention,
          activity: 'workshop',
          professional: 'Test Professional',
          area: 'Academic',
          riskLevelName: RiskLevels.Medium,
          endRiskLevelName: RiskLevels.None,
          status: InterventionStatus.Remitted,
          studentDisplay: [
            { id: 1, name: 'Aby', email: 'aby@mail.test' },
          ] as StudentProfileData[],
          commentPreview: '',
        } as InterventionRowViewModel,
      ]);
      mockFilterStrategy.apply.and.returnValue(component['interventions']());

      component.exportToCSV();

      expect(mockCsvService.exportToCSV).toHaveBeenCalled();
    });

    it('should export interventions when studentDisplay is a string (branch false)', () => {
      component['interventions'].set([
        {
          ...intervention,
          activity: undefined,
          professional: 'Test Professional',
          area: 'Academic',
          riskLevelName: RiskLevels.Medium,
          endRiskLevelName: RiskLevels.None,
          status: InterventionStatus.Remitted,
          studentDisplay: 'No student assigned',
          commentPreview: '',
        } as unknown as InterventionRowViewModel,
      ]);
      mockFilterStrategy.apply.and.returnValue(component['interventions']());

      component.exportToCSV();

      expect(mockCsvService.exportToCSV).toHaveBeenCalled();
    });

    it('should handle capitalize with null or undefined (branch true)', () => {
      expect(component['capitalize'](null)).toBe('');
      expect(component['capitalize'](undefined)).toBe('');
      expect(component['capitalize']('test')).toBe('Test');
    });
  });

  describe('sorting behavior', () => {
    const highRisk = {
      id: 1,
      dateUtc: '2026-02-20',
      riskLevelName: RiskLevels.High,
      studentDisplay: [],
      commentPreview: '',
    } as unknown as InterventionRowViewModel;

    const mediumRisk = {
      id: 2,
      dateUtc: '2026-03-01',
      riskLevelName: RiskLevels.Medium,
      studentDisplay: [],
      commentPreview: '',
    } as unknown as InterventionRowViewModel;

    const lowRisk = {
      id: 3,
      dateUtc: '2026-01-10',
      riskLevelName: RiskLevels.Low,
      endRiskLevelName: RiskLevels.Low,
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
        const anotherHigh = { ...highRisk, id: 4 } as InterventionRowViewModel;
        const result = component['compareByColumn'](
          highRisk,
          anotherHigh,
          'risk'
        );
        expect(result).toBe(0);
      });

      it('should return 0 when risk level is not found in riskRank (branch fallback)', () => {
        const unknownRiskA = {
          ...highRisk,
          riskLevelName: 'UnmappedRisk' as unknown as RiskLevels,
        } as unknown as InterventionRowViewModel;

        const unknownRiskB = {
          ...mediumRisk,
          riskLevelName: 'OtherRisk' as unknown as RiskLevels,
        } as unknown as InterventionRowViewModel;

        const result = component['compareByColumn'](
          unknownRiskA,
          unknownRiskB,
          'risk'
        );
        expect(result).toBe(0);
      });

      it('should return 0 for unknown columns', () => {
        const result = component['compareByColumn'](
          highRisk,
          mediumRisk,
          'activity'
        );
        expect(result).toBe(0);
      });
    });

    describe('sortedInterventions', () => {
      beforeEach(() => {
        component.studentNamesLookup = studentLookup;
        mockFilterStrategy.apply.and.callFake(items => items);
      });

      it('should return rows exactly when no column is sorted (branch true)', () => {
        fetchResolverMock.resolve.and.returnValue(
          of([{ ...intervention, id: 1 }])
        );
        component.loadInterventions(10);
        component['sortColumn'].set(null);

        const result = component['sortedInterventions']();
        expect(result.length).toBe(1);
      });

      it('should sort by risk level when sortColumn is "risk"', () => {
        fetchResolverMock.resolve.and.returnValue(
          of([
            { ...intervention, id: 1, riskLevelName: RiskLevels.Low },
            { ...intervention, id: 2, riskLevelName: RiskLevels.High },
            { ...intervention, id: 3, riskLevelName: RiskLevels.Medium },
          ] as InterventionModel[])
        );
        component.loadInterventions(10);
        component['onSortClick']('risk');
        const result = component['sortedInterventions']();
        expect(result.map(r => r.id)).toEqual([1, 3, 2]);
      });

      it('should reverse order when direction toggles to desc', () => {
        fetchResolverMock.resolve.and.returnValue(
          of([
            { ...intervention, id: 1, riskLevelName: RiskLevels.Low },
            { ...intervention, id: 2, riskLevelName: RiskLevels.High },
            { ...intervention, id: 3, riskLevelName: RiskLevels.Medium },
          ] as InterventionModel[])
        );
        component.loadInterventions(10);
        component['onSortClick']('risk');
        component['onSortClick']('risk');

        const result = component['sortedInterventions']();
        expect(result.map(r => r.id)).toEqual([2, 3, 1]);
      });

      it('should not mutate the original filteredInterventions array', () => {
        fetchResolverMock.resolve.and.returnValue(
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

      it('should use pagination', () => {
        fetchResolverMock.resolve.and.returnValue(
          of([
            { ...intervention, id: 1, riskLevelName: RiskLevels.High },
            { ...intervention, id: 2, riskLevelName: RiskLevels.High },
            { ...intervention, id: 3, riskLevelName: RiskLevels.High },
            { ...intervention, id: 4, riskLevelName: RiskLevels.High },
            { ...intervention, id: 5, riskLevelName: RiskLevels.High },
            { ...intervention, id: 6, riskLevelName: RiskLevels.High },
            { ...intervention2, id: 7, riskLevelName: RiskLevels.High },
            { ...intervention, id: 8, riskLevelName: RiskLevels.High },
            { ...intervention, id: 9, riskLevelName: RiskLevels.High },
            { ...intervention, id: 10, riskLevelName: RiskLevels.High },
            { ...intervention, id: 11, riskLevelName: RiskLevels.High },
            { ...intervention, id: 12, riskLevelName: RiskLevels.High },
            { ...intervention, id: 13, riskLevelName: RiskLevels.High },
          ])
        );
        component.loadInterventions(10);
        const newPageEvent: PageEvent = {
          length: 13,
          pageIndex: 1,
          pageSize: 10,
          previousPageIndex: 0,
        };
        component['onPageChange'](newPageEvent);

        const result = component['pagedInterventions']();
        expect(result.map(r => r.id)).toEqual([11, 12, 13]);
      });
    });
  });
});
