import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsCardV2Component } from './stats-card-v2.component';

describe('StatsCardV2Component', () => {
  let component: StatsCardV2Component;
  let fixture: ComponentFixture<StatsCardV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCardV2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsCardV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
