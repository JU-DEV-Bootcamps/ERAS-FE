import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { PollFiltersComponent } from './poll-filters.component';
import { CohortService } from '@core/services/api/cohort.service';
import { PollService } from '@core/services/api/poll.service';
import { EvaluationsService } from '@core/services/api/evaluations.service';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { EvaluationModel } from '@core/models/evaluation.model';
import { CohortModel } from '@core/models/cohort.model';
import { VariableModel } from '@core/models/variable.model';

type ObsType<T> = T extends Observable<infer U> ? U : unknown;

interface ComponentWithPrivate {
  _getVariables(filterNames?: string[], isInitialLoad?: boolean): void;
}

function createAutocompleteEvent(
  value: EvaluationModel | null
): MatAutocompleteSelectedEvent {
  return { option: { value } } as unknown as MatAutocompleteSelectedEvent;
}

describe('PollFiltersComponent', () => {
  let component: PollFiltersComponent;
  let fixture: ComponentFixture<PollFiltersComponent>;
  let cohortServiceSpy: jasmine.SpyObj<CohortService>;
  let pollServiceSpy: jasmine.SpyObj<PollService>;
  let evaluationsServiceSpy: jasmine.SpyObj<EvaluationsService>;

  const evalCompleted = {
    id: 1,
    name: 'Eval A',
    status: 'Completed',
    polls: [{ uuid: 'poll-uuid', name: 'Poll A' }],
    country: 'ES',
    configurationId: 1,
    latestImportJobId: 1,
    startDate: new Date(),
    endDate: new Date(),
    pollName: 'Poll A',
    pollId: 1,
  } as unknown as EvaluationModel;

  const evalInProgress = {
    id: 2,
    name: 'Eval B',
    status: 'InProgress',
    polls: [{ uuid: 'poll-uuid-2', name: 'Poll B' }],
    country: 'ES',
    configurationId: 2,
    latestImportJobId: 2,
    startDate: new Date(),
    endDate: new Date(),
    pollName: 'Poll B',
    pollId: 2,
  } as unknown as EvaluationModel;

  const evalDraft = {
    id: 3,
    name: 'Eval C',
    status: 'Draft',
    polls: [],
  } as unknown as EvaluationModel;

  beforeEach(async () => {
    cohortServiceSpy = jasmine.createSpyObj('CohortService', ['getCohorts']);
    pollServiceSpy = jasmine.createSpyObj('PollService', [
      'getVariablesByComponents',
    ]);
    evaluationsServiceSpy = jasmine.createSpyObj('EvaluationsService', [
      'getAllEvalProc',
    ]);

    evaluationsServiceSpy.getAllEvalProc.and.returnValue(
      of({
        count: 3,
        items: [evalCompleted, evalInProgress, evalDraft],
      } as unknown as ObsType<ReturnType<EvaluationsService['getAllEvalProc']>>)
    );

    await TestBed.configureTestingModule({
      imports: [PollFiltersComponent],
      providers: [
        { provide: CohortService, useValue: cohortServiceSpy },
        { provide: PollService, useValue: pollServiceSpy },
        { provide: EvaluationsService, useValue: evaluationsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PollFiltersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit / _loadEvaluations / _setupDynamicValidators', () => {
    it('keeps only Completed/InProgress evaluations', () => {
      fixture.detectChanges();
      expect(component.evaluations() as unknown).toEqual([
        evalCompleted,
        evalInProgress,
      ] as unknown);
    });

    it('sets evaluations to null on error', () => {
      evaluationsServiceSpy.getAllEvalProc.and.returnValue(
        throwError(() => new Error('fail'))
      );
      fixture.detectChanges();
      expect(component.evaluations()).toBeNull();
    });

    it('removes validators if showVariables is false', () => {
      component.showVariables = false;
      fixture.detectChanges();

      expect(component.filterForm.controls.componentNames.validator).toBeNull();
      expect(component.filterForm.controls.variables.validator).toBeNull();
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('evaluationsToScroll maps correctly', () => {
      expect(component.evaluationsToScroll()).toEqual([
        { label: 'Eval A - Completed', value: evalCompleted },
        { label: 'Eval B - InProgress', value: evalInProgress },
      ]);
    });

    it('cohortsToScroll maps correctly', () => {
      const cohorts = [
        { id: 1, name: 'C1' },
        { id: 2, name: 'C2' },
      ] as CohortModel[];
      component.cohorts.set(cohorts);
      expect(component.cohortsToScroll()).toEqual([
        { label: 'C1', value: 1 },
        { label: 'C2', value: 2 },
      ]);
    });

    it('componentsToScroll maps correctly', () => {
      component.allComponentNames.set(['Ansiedad', 'Depresion']);
      expect(component.componentsToScroll()).toEqual([
        { label: 'Ansiedad', value: 'Ansiedad' },
        { label: 'Depresion', value: 'Depresion' },
      ]);
    });

    it('variablesGroupsToScroll maps correctly', () => {
      component.variables.set([
        { pollVariableId: 10, name: 'Var1' },
        { pollVariableId: 20, name: 'Var2' },
      ] as VariableModel[]);
      expect(component.variablesGroupsToScroll()).toEqual([
        { label: 'Var1', value: 10 },
        { label: 'Var2', value: 20 },
      ]);
    });
  });

  describe('handleEvaluationSelect', () => {
    it('does nothing if evaluation is null', () => {
      fixture.detectChanges();
      component.handleEvaluationSelect(createAutocompleteEvent(null));
      expect(cohortServiceSpy.getCohorts).not.toHaveBeenCalled();
    });

    it('loads cohorts and enables fields when showVariables is true', () => {
      fixture.detectChanges();
      const cohorts = [{ id: 1, name: 'C1' }] as CohortModel[];
      cohortServiceSpy.getCohorts.and.returnValue(
        of({ body: cohorts, success: true } as unknown as ObsType<
          ReturnType<CohortService['getCohorts']>
        >)
      );
      pollServiceSpy.getVariablesByComponents.and.returnValue(of([]));

      component.handleEvaluationSelect(createAutocompleteEvent(evalCompleted));

      expect(component.cohorts()).toEqual(cohorts);
      expect(component.filterForm.controls.cohortIds.enabled).toBeTrue();
      expect(component.filterForm.controls.componentNames.enabled).toBeTrue();
    });

    it('handles cohort loading error safely', () => {
      fixture.detectChanges();
      cohortServiceSpy.getCohorts.and.returnValue(
        throwError(() => new Error('Error'))
      );
      component.handleEvaluationSelect(createAutocompleteEvent(evalCompleted));

      expect(component.cohorts()).toEqual([]);
      expect(component.filtersLoading()).toBeFalse();
    });
  });

  describe('handleCohortSelect', () => {
    it('returns early if isOpen is true', () => {
      fixture.detectChanges();
      component.filterForm.enable();
      component.prevCohortIds = [];
      component.filterForm.patchValue({ cohortIds: [1] });
      component.handleCohortSelect(true);
      expect(component.prevCohortIds).toEqual([]);
    });

    it('returns early if showVariables is false', () => {
      fixture.detectChanges();
      component.showVariables = false;
      component.filterForm.enable();
      component.filterForm.patchValue({ cohortIds: [1] });
      component.handleCohortSelect(false);
      expect(component.prevCohortIds).toEqual([]);
    });

    it('returns early if arrays are equal', () => {
      fixture.detectChanges();
      component.filterForm.enable();
      component.prevCohortIds = [1];
      component.filterForm.patchValue({ cohortIds: [1] });
      component.handleCohortSelect(false);
      expect(component.prevCohortIds).toEqual([1]);
    });

    it('updates prevCohortIds when closed and changed', () => {
      fixture.detectChanges();
      component.showVariables = true;
      component.filterForm.enable();
      component.filterForm.patchValue({ cohortIds: [1, 2] });

      pollServiceSpy.getVariablesByComponents.and.returnValue(of([]));

      component.handleCohortSelect(false);
      expect(component.prevCohortIds).toEqual([1, 2]);
    });
  });

  describe('handleComponentsSelect', () => {
    it('returns early if isOpen or control is disabled or arrays are equal', () => {
      fixture.detectChanges();
      component.filterForm.enable();
      component.prevComponentSelections = ['A'];

      // isOpen true
      component.filterForm.patchValue({ componentNames: ['B'] });
      component.handleComponentsSelect(true);
      expect(component.prevComponentSelections).toEqual(['A']);

      // disabled
      component.filterForm.disable();
      component.handleComponentsSelect(false);
      expect(component.prevComponentSelections).toEqual(['A']);

      // arrays equal
      component.filterForm.enable();
      component.filterForm.patchValue({ componentNames: ['A'] });
      component.handleComponentsSelect(false);
      expect(component.prevComponentSelections).toEqual(['A']);
    });

    it('clears and disables variables if no componentNames are selected', () => {
      fixture.detectChanges();
      component.filterForm.enable();
      component.prevComponentSelections = ['Ansiedad'];

      component.filterForm.patchValue({ componentNames: [] });
      component.handleComponentsSelect(false);

      expect(component.variables()).toEqual([]);
      expect(component.filterForm.controls.variables.disabled).toBeTrue();
    });

    it('builds variable groups and updates form on valid selection', fakeAsync(() => {
      fixture.detectChanges();
      component.filterForm.enable();
      const variables = [
        { pollVariableId: 100, name: 'V1', componentName: 'Ansiedad' },
      ] as VariableModel[];

      component.variablesClone = variables;

      component.prevComponentSelections = [];
      component.filterForm.patchValue({ componentNames: ['Ansiedad'] });

      component.handleComponentsSelect(false);
      tick();

      expect(component.variableSelectGroups()[0].label).toBe('ANSIEDAD');
      expect(component.filterForm.controls.variables.enabled).toBeTrue();
      expect(component.filterForm.value.variables).toEqual([100]);
    }));
  });

  describe('handleVariableSelect', () => {
    it('updates prevVariablesSelections when closed and changed', () => {
      fixture.detectChanges();
      component.filterForm.enable();
      component.prevVariablesSelections = [1];

      // isOpen true -> nothing happens
      component.filterForm.patchValue({ variables: [1, 2] });
      component.handleVariableSelect(true);
      expect(component.prevVariablesSelections).toEqual([1]);

      // array equal -> nothing happens
      component.filterForm.patchValue({ variables: [1] });
      component.handleVariableSelect(false);
      expect(component.prevVariablesSelections).toEqual([1]);

      // changed -> updates
      component.filterForm.patchValue({ variables: [1, 2] });
      component.handleVariableSelect(false);
      expect(component.prevVariablesSelections).toEqual([1, 2]);
    });
  });

  describe('Selection Getters', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.filterForm.enable();
      component.cohorts.set([
        { id: 1, name: 'C1' },
        { id: 2, name: 'C2' },
      ] as CohortModel[]);
      component.componentNames.set(['Ansiedad', 'Depresion']);
      component.variables.set([
        { pollVariableId: 10, name: 'Var1' },
        { pollVariableId: 20, name: 'Var2' },
      ] as VariableModel[]);

      Object.defineProperty(component.cohorts, 'length', {
        value: 2,
        configurable: true,
      });
      Object.defineProperty(component.componentNames, 'length', {
        value: 2,
        configurable: true,
      });
      Object.defineProperty(component.variables, 'length', {
        value: 2,
        configurable: true,
      });
    });

    it('getCohortsSelection', () => {
      component.filterForm.patchValue({ cohortIds: [1, 2] });
      expect(component.getCohortsSelection()).toEqual(['Select all']);

      component.filterForm.patchValue({ cohortIds: [1] });
      expect(component.getCohortsSelection()).toEqual(['C1']);
    });

    it('getComponentsSelection', () => {
      component.filterForm.patchValue({
        componentNames: ['Ansiedad', 'Depresion'],
      });
      expect(component.getComponentsSelection()).toEqual(['Select all']);

      component.filterForm.patchValue({ componentNames: ['Ansiedad'] });
      expect(component.getComponentsSelection()).toEqual(['Ansiedad']);
    });

    it('getVariablesSelection', () => {
      component.filterForm.patchValue({
        variables: [10, 20],
        componentNames: ['Ansiedad'],
      });
      expect(component.getVariablesSelection()).toEqual(['Select all']);

      component.filterForm.patchValue({ variables: [10] });
      expect(component.getVariablesSelection()).toEqual(['Var1']);
    });
  });

  describe('getAllVariableIds', () => {
    it('returns ids of all loaded variables', () => {
      fixture.detectChanges();
      component.variables.set([
        { pollVariableId: 500, name: 'X' },
      ] as VariableModel[]);
      expect(component.getAllVariableIds()).toEqual([500]);
    });
  });

  describe('onApply / _sendFilters', () => {
    it('does nothing if there are no polls', () => {
      fixture.detectChanges();
      spyOn(component.filters, 'emit');
      component.polls = [];

      component.onApply();
      expect(component.filters.emit).not.toHaveBeenCalled();
    });

    it('emits filters with current values (showVariables true)', () => {
      fixture.detectChanges();
      component.filterForm.enable();
      spyOn(component.filters, 'emit');
      component.polls = [
        { uuid: 'p-1', name: 'P1' },
      ] as unknown as EvaluationModel['polls'];
      component.variableSelectGroups.set([{ label: 'ANSIEDAD', items: [] }]);

      component.filterForm.patchValue({
        selectedEvaluation: evalCompleted as unknown as never,
        cohortIds: [1],
        componentNames: ['Ansiedad'],
        variables: [100],
      });

      component.onApply();
      expect(component.filters.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          uuid: 'p-1',
          cohortIds: [1],
          variableIds: [100],
          selectedComponentIndex: [0],
          selectedComponents: ['Ansiedad'],
        })
      );
    });

    it('emits filters without variables if showVariables is false', () => {
      component.showVariables = false;
      fixture.detectChanges();
      component.filterForm.enable();
      spyOn(component.filters, 'emit');
      component.polls = [
        { uuid: 'p-1', name: 'P1' },
      ] as unknown as EvaluationModel['polls'];

      component.filterForm.patchValue({
        selectedEvaluation: evalCompleted as unknown as never,
        cohortIds: [1],
        variables: [100],
      });

      component.onApply();
      expect(component.filters.emit).toHaveBeenCalledWith(
        jasmine.objectContaining({
          uuid: 'p-1',
          cohortIds: [1],
          variableIds: [],
        })
      );
    });
  });

  describe('_getVariables', () => {
    it('handles variables fetch error safely', () => {
      fixture.detectChanges();
      component.filterForm.enable();

      component.polls = [
        { uuid: 'p-1', name: 'P1' },
      ] as unknown as EvaluationModel['polls'];
      component.filterForm.patchValue({ componentNames: ['Ansiedad'] });

      pollServiceSpy.getVariablesByComponents.and.returnValue(
        throwError(() => new Error('Error'))
      );

      (component as unknown as ComponentWithPrivate)._getVariables(
        ['Ansiedad'],
        false
      );

      expect(component.variables()).toEqual([]);
      expect(component.variableSelectGroups()).toEqual([]);
      expect(component.filtersLoading()).toBeFalse();
    });

    it('handles variables fetch returning null safely', () => {
      fixture.detectChanges();
      component.filterForm.enable();

      component.polls = [
        { uuid: 'p-1', name: 'P1' },
      ] as unknown as EvaluationModel['polls'];
      component.filterForm.patchValue({ componentNames: ['Ansiedad'] });

      pollServiceSpy.getVariablesByComponents.and.returnValue(
        of(
          null as unknown as ObsType<
            ReturnType<PollService['getVariablesByComponents']>
          >
        )
      );

      (component as unknown as ComponentWithPrivate)._getVariables(
        ['Ansiedad'],
        false
      );

      expect(component.filtersLoading()).toBeFalse();
    });
  });
});
