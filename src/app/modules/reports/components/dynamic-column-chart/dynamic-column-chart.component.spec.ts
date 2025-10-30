import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicColumnChartComponent } from './dynamic-column-chart.component';

describe('DynamicColumnChartsComponent', () => {
  let component: DynamicColumnChartComponent;
  let fixture: ComponentFixture<DynamicColumnChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicColumnChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicColumnChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
