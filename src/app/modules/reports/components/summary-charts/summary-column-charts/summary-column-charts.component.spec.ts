import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryColumnChartsComponent } from './summary-column-charts.component';

describe('SummaryColumnChartsComponent', () => {
  let component: SummaryColumnChartsComponent;
  let fixture: ComponentFixture<SummaryColumnChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryColumnChartsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryColumnChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
