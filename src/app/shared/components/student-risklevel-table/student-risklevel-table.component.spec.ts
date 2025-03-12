import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentRisklevelTableComponent } from './student-risklevel-table.component';

describe('StudentRisklevelTableComponent', () => {
  let component: StudentRisklevelTableComponent;
  let fixture: ComponentFixture<StudentRisklevelTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentRisklevelTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentRisklevelTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
