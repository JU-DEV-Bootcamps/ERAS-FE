import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskStudentsComponent } from './risk-students.component';

describe('RiskStudentsComponent', () => {
  let component: RiskStudentsComponent;
  let fixture: ComponentFixture<RiskStudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskStudentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
