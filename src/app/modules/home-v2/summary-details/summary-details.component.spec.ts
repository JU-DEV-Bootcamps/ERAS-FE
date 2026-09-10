import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardKpiResponse } from '@core/models/dashboard-kpis.model';
import { DashboardService } from '@core/services/api/dashboard.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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

describe('SummaryDetailsV2Component - additional scenarios', () => {
  let component: SummaryDetailsV2Component;
  let fixture: ComponentFixture<SummaryDetailsV2Component>;

  const mockDashboardKpi: DashboardKpiResponse = {
    body: {
      totalStudents: { value: 0, percentageChange: 12 },
      totalPollsAnswered: { value: 0, percentageChange: 12 },
      totalEvaluations: { value: 0, percentageChange: 12 },
    },
    message: '',
    status: '',
    success: false,
    validationErrors: [],
  } as DashboardKpiResponse;

  let dashboardServiceMock: {
    getDashboardKPI: jasmine.Spy;
    getLastFetchedAt: jasmine.Spy;
  };
  let breakpointObserverMock: { observe: jasmine.Spy };

  const configureTestBed = async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryDetailsV2Component],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryDetailsV2Component);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    dashboardServiceMock = {
      getDashboardKPI: jasmine
        .createSpy('getDashboardKPI')
        .and.returnValue(of(mockDashboardKpi)),
      getLastFetchedAt: jasmine.createSpy('getLastFetchedAt'),
    };
    breakpointObserverMock = {
      observe: jasmine
        .createSpy('observe')
        .and.returnValue(of({ matches: false })),
    };
  });

  it('should emit lastUpdated when getLastFetchedAt returns a date', async () => {
    const fetchedAt = new Date('2026-09-08T10:00:00Z');
    dashboardServiceMock.getLastFetchedAt.and.returnValue(fetchedAt);
    await configureTestBed();

    const emitSpy = spyOn(component.lastUpdated, 'emit');

    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith(fetchedAt);
  });

  it('should not emit lastUpdated when getLastFetchedAt returns null', async () => {
    dashboardServiceMock.getLastFetchedAt.and.returnValue(null);
    await configureTestBed();

    const emitSpy = spyOn(component.lastUpdated, 'emit');

    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should set gridColumns to 1 when XSmall breakpoint matches', async () => {
    breakpointObserverMock.observe.and.returnValue(of({ matches: true }));
    dashboardServiceMock.getLastFetchedAt.and.returnValue(null);
    await configureTestBed();

    fixture.detectChanges();

    expect(component.gridColumns()).toBe(1);
  });

  it('should call breakpointObserver.observe with Breakpoints.XSmall', async () => {
    dashboardServiceMock.getLastFetchedAt.and.returnValue(null);
    await configureTestBed();

    fixture.detectChanges();

    expect(breakpointObserverMock.observe).toHaveBeenCalledWith([
      Breakpoints.XSmall,
    ]);
  });
});
