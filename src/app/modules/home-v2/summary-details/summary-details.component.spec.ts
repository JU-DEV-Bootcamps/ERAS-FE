import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SummaryDetailsComponent } from './summary-details.component';
import { DashboardKpiResponse } from '@core/models/dashboard-kpis.model';
import { DashboardService } from '@core/services/api/dashboard.service';
import { BreakpointObserver } from '@angular/cdk/layout';

describe('SummaryDetailsComponent', () => {
  let component: SummaryDetailsComponent;
  let fixture: ComponentFixture<SummaryDetailsComponent>;

  const mockDashboardKpi: DashboardKpiResponse = {
    body: {
      totalStudents: {
        value: 0,
        percentageChange: 12,
      },
      totalPollsAnswered: {
        value: 0,
        percentageChange: 12,
      },
      totalEvaluations: {
        value: 0,
        percentageChange: 12,
      },
    },
    message: '',
    status: '',
    success: false,
    validationErrors: [],
  } as DashboardKpiResponse;

  const dashboardServiceMock = {
    getDashboardKPI: jasmine
      .createSpy('getDashboardKPI')
      .and.returnValue(of(mockDashboardKpi)),
  };

  const breakpointObserverMock = {
    observe: jasmine
      .createSpy('observe')
      .and.returnValue(of({ matches: false })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryDetailsComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard KPIs on init', () => {
    expect(dashboardServiceMock.getDashboardKPI).toHaveBeenCalled();
    expect(component.kpi).toEqual(mockDashboardKpi);
  });

  it('should set gridColumns to 3 when not XSmall', () => {
    expect(component.gridColumns()).toBe(3);
  });
});
