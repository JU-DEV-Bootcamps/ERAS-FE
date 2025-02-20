import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPollsByCohortComponent } from './list-polls-by-cohort.component';

describe('ListPollsByCohortComponent', () => {
  let component: ListPollsByCohortComponent;
  let fixture: ComponentFixture<ListPollsByCohortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPollsByCohortComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPollsByCohortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
