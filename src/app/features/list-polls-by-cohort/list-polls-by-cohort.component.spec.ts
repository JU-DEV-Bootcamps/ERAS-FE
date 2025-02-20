import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListPollsByCohortComponent } from './list-polls-by-cohort.component';
import { CohortService } from '../../core/services/cohort.service';
import { of } from 'rxjs';

const mockCohortService = {
  getCohorts: () => of([]),
};

describe('ListPollsByCohortComponent', () => {
  let component: ListPollsByCohortComponent;
  let fixture: ComponentFixture<ListPollsByCohortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPollsByCohortComponent],
      providers: [{ provide: CohortService, useValue: mockCohortService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ListPollsByCohortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
