import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListStudentsByPollComponent } from './list-students-by-poll.component';

describe('ListStudentsByPollComponent', () => {
  let component: ListStudentsByPollComponent;
  let fixture: ComponentFixture<ListStudentsByPollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListStudentsByPollComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListStudentsByPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
