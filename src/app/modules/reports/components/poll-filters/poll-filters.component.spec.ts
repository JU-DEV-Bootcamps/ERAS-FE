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
import { EvaluationModel } from '@core/models/summary.model';
import { CohortModel } from '@core/models/cohort.model';
import { VariableModel } from '@core/models/variable.model';

type ObsType<T> = T extends Observable<infer U> ? U : unknown;

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

  describe('ngOnInit / _loadEvaluations', () => {
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
  });

  describe('handleEvaluationSelect', () => {
    it('loads cohorts and enables fields', () => {
      fixture.detectChanges();
      const cohorts = [{ id: 1, name: 'C1' }] as CohortModel[];

      cohortServiceSpy.getCohorts.and.returnValue(
        of({
          body: cohorts,
          success: true,
          message: '',
          validationErrors: [],
        } as unknown as ObsType<ReturnType<CohortService['getCohorts']>>)
      );
      pollServiceSpy.getVariablesByComponents.and.returnValue(of([]));

      component.handleEvaluationSelect(createAutocompleteEvent(evalCompleted));
      expect(component.cohorts()).toEqual(cohorts);
      expect(component.filterForm.controls.cohortIds.enabled).toBeTrue();
    });
  });

  describe('handleCohortSelect', () => {
    it('updates prevCohortIds when closed', () => {
      fixture.detectChanges();
      component.showVariables = true;
      component.filterForm.controls.cohortIds.enable();
      component.filterForm.controls.cohortIds.setValue([1, 2]);
      pollServiceSpy.getVariablesByComponents.and.returnValue(of([]));
      component.handleCohortSelect(false);
      expect(component.prevCohortIds).toEqual([1, 2]);
    });
  });

  describe('handleComponentsSelect', () => {
    it('builds variable groups', fakeAsync(() => {
      fixture.detectChanges();
      const variables = [
        { pollVariableId: 100, name: 'V1', componentName: 'Ansiedad' },
      ] as VariableModel[];
      pollServiceSpy.getVariablesByComponents.and.returnValue(of(variables));

      cohortServiceSpy.getCohorts.and.returnValue(
        of({
          body: [],
          success: true,
          message: '',
          validationErrors: [],
        } as unknown as ObsType<ReturnType<CohortService['getCohorts']>>)
      );

      component.handleEvaluationSelect(createAutocompleteEvent(evalCompleted));
      tick();
      component.filterForm.controls.componentNames.setValue(['Ansiedad']);
      component.handleComponentsSelect(false);
      tick();
      expect(component.variableSelectGroups()[0].label).toBe('ANSIEDAD');
    }));
  });

  describe('onApply', () => {
    it('emits filters with current values', () => {
      fixture.detectChanges();
      spyOn(component.filters, 'emit');
      component.polls = [
        { uuid: 'p-1', name: 'P1' },
      ] as unknown as EvaluationModel['polls'];
      component.variableSelectGroups.set([{ label: 'A', items: [] }]);

      component.filterForm.patchValue({
        selectedEvaluation: evalCompleted as unknown as never,
        cohortIds: [1],
        componentNames: ['Ansiedad'],
        variables: [100],
      });

      component.onApply();
      expect(component.filters.emit).toHaveBeenCalled();
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
});
