import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentAlertsComponent } from './recent-alerts.component';

describe('RecentAlertsComponent', () => {
  let component: RecentAlertsComponent;
  let fixture: ComponentFixture<RecentAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentAlertsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
