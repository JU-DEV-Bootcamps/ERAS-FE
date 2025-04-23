import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListPollInstancesByFiltersComponent } from './list-poll-instances-by-filters.component';
import { PollInstanceService } from '../../core/services/poll-instance.service';
import { CohortService } from '../../core/services/cohort.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { PollInstance } from '../../core/services/Types/pollInstance';

describe('ListPollInstancesByFiltersComponent', () => {
  let component: ListPollInstancesByFiltersComponent;
  let fixture: ComponentFixture<ListPollInstancesByFiltersComponent>;
  const mockPollInstanceService = jasmine.createSpyObj('PollInstanceService', [
    'getPollsByCohortId',
  ]);
  const mockCohortService = jasmine.createSpyObj('CohortService', [
    'getCohorts',
  ]);

  beforeEach(async () => {
    mockPollInstanceService.getPollInstancesByFilters.and.returnValue(
      of({ body: [] })
    );
    mockCohortService.getCohorts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ListPollInstancesByFiltersComponent],
      providers: [
        { provide: PollInstanceService, useValue: mockPollInstanceService },
        { provide: CohortService, useValue: mockCohortService },
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
    expect(mockPollInstanceService.getPollsByCohortId).toHaveBeenCalled();
    expect(component.pollInstances.length).toBe(0);
  });

  it('should update poll instances on selection change for polls', () => {
    component.onSelectionChange();
    expect(mockPollInstanceService.getPollsByCohortId).toHaveBeenCalledWith(
      0,
      15
    );
  });

  it('should update poll instances on selection change for cohortId', () => {
    mockPollInstanceService.getPollInstancesByFilters.calls.reset();
    component.cohortsData = [
      {
        id: 1,
        name: 'Test Cohort',
        courseCode: '',
        audit: { createdBy: '', modifiedBy: '', createdAt: '', modifiedAt: '' },
      },
    ];
    component.onSelectionChange();
    expect(mockPollInstanceService.getPollsByCohortId).toHaveBeenCalledWith(
      1,
      30
    );
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
    const pollInstance = { student: { id: 1 } } as PollInstance;
    component.goToDetails(pollInstance);
    expect(window.open).toHaveBeenCalledWith('student-details/1', '_blank');
  });
});
