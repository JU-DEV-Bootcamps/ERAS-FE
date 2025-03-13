import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskStudentsTableComponent } from './risk-students-table.component';

describe('RiskStudentsTableComponent', () => {
  let component: RiskStudentsTableComponent;
  let fixture: ComponentFixture<RiskStudentsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskStudentsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskStudentsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
