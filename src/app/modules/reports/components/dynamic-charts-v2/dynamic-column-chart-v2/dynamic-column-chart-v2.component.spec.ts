import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicColumnChartV2Component } from './dynamic-column-chart-v2.component';

describe('DynamicColumnChartsV2Component', () => {
  let component: DynamicColumnChartV2Component;
  let fixture: ComponentFixture<DynamicColumnChartV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicColumnChartV2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicColumnChartV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
