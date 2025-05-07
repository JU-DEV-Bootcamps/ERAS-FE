import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListPollInstancesByFiltersComponent } from './list-poll-instances-by-filters.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { PollInstanceService } from '../../core/services/api/poll-instance.service';
import { CohortService } from '../../core/services/api/cohort.service';
import { PollService } from '../../core/services/api/poll.service';

describe('ListPollInstancesByFiltersComponent', () => {
  let component: ListPollInstancesByFiltersComponent;
  let fixture: ComponentFixture<ListPollInstancesByFiltersComponent>;
  const mockPollInstanceService = jasmine.createSpyObj('PollInstanceService', [
    'getPollInstancesByFilters',
  ]);
  const mockCohortService = jasmine.createSpyObj('CohortService', [
    'getCohorts',
  ]);
  const mockPollService = jasmine.createSpyObj('PollService', [
    'getPollsByCohortId',
  ]);

  beforeEach(async () => {
    mockPollInstanceService.getPollInstancesByFilters.and.returnValue(
      of({ body: [] })
    );
    mockCohortService.getCohorts.and.returnValue(of([]));
    mockPollService.getPollsByCohortId.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ListPollInstancesByFiltersComponent],
      providers: [
        { provide: PollInstanceService, useValue: mockPollInstanceService },
        { provide: CohortService, useValue: mockCohortService },
        { provide: PollService, useValue: mockPollService },
        provideNoopAnimations(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListPollInstancesByFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cohorts on init', () => {
    expect(mockCohortService.getCohorts).toHaveBeenCalled();
    expect(component.cohortsData.length).toBeGreaterThan(0);
  });

  it('should update polls on selection change for cohortId', () => {
    mockPollService.getPollsByCohortId.calls.reset();
    component.filtersForm.controls['selectedCohort'].setValue(1);
    expect(mockPollService.getPollsByCohortId).toHaveBeenCalledWith(1);
    expect(component.selectedCohortId).toBe(1);
  });

  it('should update poll instances on selection change', () => {
    mockPollInstanceService.getPollInstancesByFilters.calls.reset();
    component.filtersForm.controls['selectedCohort'].setValue(1);
    component.filtersForm.controls['selectedPoll'].setValue('test-uuid');
    component.onSelectionChange();
    expect(
      mockPollInstanceService.getPollInstancesByFilters
    ).toHaveBeenCalledWith(1, 0);
  });

  it('should return correct width for columns in getWidth', () => {
    expect(component.getWidth('modifiedAt')).toBe('15%');
    expect(component.getWidth('finishedAt')).toBe('15%');
    expect(component.getWidth('name')).toBe('20%');
    expect(component.getWidth('email')).toBe('20%');
    expect(component.getWidth('uuid')).toBe('');
  });
});
