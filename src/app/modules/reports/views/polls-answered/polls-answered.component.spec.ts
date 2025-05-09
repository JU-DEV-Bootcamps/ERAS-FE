import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollsAnsweredComponent } from './polls-answered.component';

describe('PollsAnsweredComponent', () => {
  let component: PollsAnsweredComponent;
  let fixture: ComponentFixture<PollsAnsweredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollsAnsweredComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollsAnsweredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
