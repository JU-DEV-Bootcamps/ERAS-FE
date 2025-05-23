import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { PollInstanceService } from '../../../../core/services/api/poll-instance.service';
import { CohortService } from '../../../../core/services/api/cohort.service';
import { PollService } from '../../../../core/services/api/poll.service';
import { PollsAnsweredComponent } from './polls-answered.component';

describe('PollsAnsweredComponent', () => {
  let component: PollsAnsweredComponent;
  let fixture: ComponentFixture<PollsAnsweredComponent>;
  const mockPollInstanceService = jasmine.createSpyObj('PollInstanceService', [
    'getPollInstancesByFilters',
  ]);
  const mockCohortService = jasmine.createSpyObj('CohortService', [
    'getCohorts',
  ]);
  const mockPollService = jasmine.createSpyObj('PollService', [
    'getPollsByCohortId',
    'getAllPolls', // Se agregó el método faltante
  ]);

  beforeEach(async () => {
    mockPollInstanceService.getPollInstancesByFilters.and.returnValue(
      of({ body: [] })
    );
    mockCohortService.getCohorts.and.returnValue(
      of({
        body: [],
      })
    );
    mockPollService.getPollsByCohortId.and.returnValue(of([]));
    mockPollService.getAllPolls.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [PollsAnsweredComponent],
      providers: [
        { provide: PollInstanceService, useValue: mockPollInstanceService },
        { provide: CohortService, useValue: mockCohortService },
        { provide: PollService, useValue: mockPollService },
        provideNoopAnimations(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PollsAnsweredComponent);
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

  it('should return correct width for columns in getWidth', () => {
    expect(component.getWidth('modifiedAt')).toBe('15%');
    expect(component.getWidth('finishedAt')).toBe('15%');
    expect(component.getWidth('name')).toBe('20%');
    expect(component.getWidth('email')).toBe('20%');
    expect(component.getWidth('uuid')).toBe('');
  });
});
