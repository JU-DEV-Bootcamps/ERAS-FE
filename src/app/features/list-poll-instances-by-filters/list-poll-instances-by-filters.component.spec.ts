import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListPollInstancesByFiltersComponent } from './list-poll-instances-by-filters.component';
import { PollInstanceService } from '../../core/services/poll-instance.service';
import { CohortService } from '../../core/services/cohort.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { PollService } from '../../core/services/poll.service';

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
        provideHttpClientTesting(),
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

  it('should load poll instances on init', () => {
    expect(
      mockPollInstanceService.getPollInstancesByFilters
    ).toHaveBeenCalled();
    expect(component.pollInstances.length).toBe(0);
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

  it('should open new window with correct URL on goToDetails', () => {
    spyOn(window, 'open');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pollInstance = { student: { id: 1 } } as any;
    component.goToDetails(pollInstance);
    expect(window.open).toHaveBeenCalledWith('student-details/1', '_blank');
  });

  it('should open heat map summary with correct query params', () => {
    spyOn(window, 'open');
    component.filtersForm.controls['selectedCohort'].setValue(1);
    component.filtersForm.controls['selectedPoll'].setValue('test-uuid');
    component.generateHeatMap();
    expect(window.open).toHaveBeenCalledWith(
      '/heat-map-summary?cohortId=1&pollUuid=test-uuid',
      '_blank'
    );
  });
});
