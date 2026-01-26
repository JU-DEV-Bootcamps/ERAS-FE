import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicChartsV2Component } from './dynamic-charts-v2.component';

describe('DynamicChartsV2Component', () => {
  let component: DynamicChartsV2Component;
  let fixture: ComponentFixture<DynamicChartsV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicChartsV2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicChartsV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create DynamicChartsV2Component', () => {
    expect(component).toBeTruthy();
  });
});
