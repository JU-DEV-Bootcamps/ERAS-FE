import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardKpiResponse } from '@core/models/dashboard-kpis.model';
import { DashboardService } from '@core/services/api/dashboard.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SummaryDetailsV2Component } from './summary-details.component';

describe('SummaryDetailsV2Component', () => {
  let component: SummaryDetailsV2Component;
  let fixture: ComponentFixture<SummaryDetailsV2Component>;

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
      imports: [SummaryDetailsV2Component],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryDetailsV2Component);
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
