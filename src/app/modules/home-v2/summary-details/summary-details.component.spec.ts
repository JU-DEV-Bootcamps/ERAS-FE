import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardKpiResponse } from '@core/models/dashboard-kpis.model';
import { DashboardService } from '@core/services/api/dashboard.service';
import { signal } from '@angular/core';
import { ViewportService } from '@core/services/layout/viewport.service';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryDetailsV2Component],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: ViewportService, useValue: { isMobile: signal(false) } },
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

  const configureTestBed = async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryDetailsV2Component],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: ViewportService, useValue: { isMobile: signal(false) } },
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
});

describe('SummaryDetailsV2Component - mobile layout', () => {
  const kpi = {
    body: {
      totalStudents: { value: 10, percentageChange: 12 },
      totalPollsAnswered: { value: 20, percentageChange: 12 },
      totalEvaluations: { value: 30, percentageChange: 12 },
    },
  } as DashboardKpiResponse;

  const render = async (isMobile: boolean) => {
    await TestBed.configureTestingModule({
      imports: [SummaryDetailsV2Component],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getDashboardKPI: () => of(kpi),
            getLastFetchedAt: () => null,
          },
        },
        { provide: ViewportService, useValue: { isMobile: signal(isMobile) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(SummaryDetailsV2Component);
    const host = fixture.nativeElement as HTMLElement;
    host.style.display = 'block';
    host.style.width = '375px';
    fixture.detectChanges();
    return host;
  };

  it('[671-home-and-recent-alerts-mobile/AC-1] stacks the three summary cards in one column without overflow on mobile', async () => {
    // GIVEN a 375px wide screen
    // WHEN the user opens Home
    const host = await render(true);

    // THEN the three cards are one below the other and none is cut off
    const tiles = Array.from(
      host.querySelectorAll<HTMLElement>('.grid-tile')
    ).map(t => t.getBoundingClientRect());
    expect(tiles.length).toBe(3);
    expect(tiles[1].top).toBeGreaterThanOrEqual(tiles[0].bottom);
    expect(tiles[2].top).toBeGreaterThanOrEqual(tiles[1].bottom);
    expect(tiles[0].left).toBe(tiles[1].left);
    expect(tiles[0].right).toBeLessThanOrEqual(
      host.getBoundingClientRect().right
    );
    expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
  });
});
