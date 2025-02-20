import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ListPollsByCohortComponent } from './list-polls-by-cohort.component';
import { CohortService } from '../../core/services/cohort.service';
import { PollsService } from '../../core/services/polls.service';
import { of } from 'rxjs';

const mockCohortService = {
  getCohorts: () => of([]),
};

const mockPollsService = {
  getPolls: () => of([]),
};

describe('ListPollsByCohortComponent', () => {
  let component: ListPollsByCohortComponent;
  let fixture: ComponentFixture<ListPollsByCohortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPollsByCohortComponent],
      providers: [
        provideHttpClient(),
        { provide: CohortService, useValue: mockCohortService },
        { provide: PollsService, useValue: mockPollsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListPollsByCohortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
