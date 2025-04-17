import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDetailOptionComponent } from './student-detail-option.component';

describe('StudentDetailOptionComponent', () => {
  let component: StudentDetailOptionComponent;
  let fixture: ComponentFixture<StudentDetailOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetailOptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
