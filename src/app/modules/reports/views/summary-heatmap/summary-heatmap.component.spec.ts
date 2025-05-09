import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryHeatmapComponent } from './summary-heatmap.component';

describe('SummaryHeatmapComponent', () => {
  let component: SummaryHeatmapComponent;
  let fixture: ComponentFixture<SummaryHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryHeatmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
