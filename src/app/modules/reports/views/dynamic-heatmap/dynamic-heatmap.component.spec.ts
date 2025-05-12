import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicHeatmapComponent } from './dynamic-heatmap.component';

describe('DynamicHeatmapComponent', () => {
  let component: DynamicHeatmapComponent;
  let fixture: ComponentFixture<DynamicHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicHeatmapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
