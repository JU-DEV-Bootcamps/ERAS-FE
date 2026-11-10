import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { delay, of } from 'rxjs';
import { ERASRoles } from '@core/models/profile.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { DashboardService } from '@core/services/api/dashboard.service';
import { EvaluationDetailsService } from '@core/services/api/evaluation-details.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { ViewportService } from '@core/services/layout/viewport.service';
import { HomeV2Component } from './home.component';

describe('HomeV2Component - mobile layout', () => {
  const originalInnerWidth = window.innerWidth;

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: width,
    });
  };

  const kpi = {
    body: {
      totalStudents: { value: 10, percentageChange: 12 },
      totalPollsAnswered: { value: 20, percentageChange: 12 },
      totalEvaluations: { value: 30, percentageChange: 12 },
    },
  };

  const render = async (width: number, role: ERASRoles) => {
    const isMobile = width < 768;
    setWindowWidth(width);
    await TestBed.configureTestingModule({
      imports: [HomeV2Component],
      providers: [
        provideRouter([]),
        { provide: ViewportService, useValue: { isMobile: signal(isMobile) } },
        {
          provide: DashboardService,
          useValue: {
            getDashboardKPI: () => of(kpi),
            getLastFetchedAt: () => null,
          },
        },
        {
          provide: EvaluationDetailsService,
          useValue: {
            getRecentAlerts: () =>
              of({
                items: [
                  {
                    studentId: 'S-1001',
                    studentName: 'Ana Torres',
                    riskLevel: 'High',
                    category: 'Attendance',
                    date: new Date('2026-11-01'),
                    status: 'Base',
                  },
                ],
                count: 1,
              }).pipe(delay(0)),
          },
        },
        {
          provide: ConfigurationsService,
          useValue: { getConfigurationsByUserId: () => of([]) },
        },
        {
          provide: ServiceProvidersService,
          useValue: { getAllServiceProviders: () => of([]) },
        },
        {
          provide: UserDataService,
          useValue: { user: () => ({ id: '1', role }) },
        },
        {
          provide: CosmicLatteService,
          useValue: { healthCheck: () => of({}) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomeV2Component);
    const host = fixture.nativeElement as HTMLElement;
    host.style.display = 'block';
    host.style.width = `${width}px`;
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();
    return host;
  };

  const headings = (host: HTMLElement) =>
    Array.from(host.querySelectorAll('h2')).map(h => h.textContent?.trim());

  const sameSectionsOnMobileAndDesktop = async (role: ERASRoles) => {
    const mobileHost = await render(375, role);
    const mobile = headings(mobileHost);
    TestBed.resetTestingModule();
    const desktop = headings(await render(1280, role));

    expect(mobile).toEqual(['Overview', 'Recent Alerts', 'Connected Services']);
    expect(mobile).toEqual(desktop);
  };

  afterEach(() => setWindowWidth(originalInnerWidth));

  it('[671-home-and-recent-alerts-mobile/AC-3] fits the Recent Alerts block below the summary cards on mobile', async () => {
    // GIVEN at least one recent alert on a 375px wide screen
    // WHEN the user opens Home
    const host = await render(375, ERASRoles.ADMIN);

    // THEN the block, with its "View All" link, is as wide as the content and below the cards
    const container = host.querySelector(
      '.section-alerts-support'
    ) as HTMLElement;
    const block = host.querySelector('.recent-alerts') as HTMLElement;
    const cards = host.querySelector('.grid-list') as HTMLElement;
    expect(
      Math.abs(
        block.getBoundingClientRect().width -
          container.getBoundingClientRect().width
      )
    ).toBeLessThan(1);
    expect(block.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      cards.getBoundingClientRect().bottom
    );
    expect(block.textContent).toContain('View All');
    expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);
  });

  it('[671-home-and-recent-alerts-mobile/AC-6] shows a Professional the same sections on mobile and on desktop', async () => {
    // GIVEN an "ERAS Professional"
    // WHEN they open Home on a 375px and on a 1280px wide screen
    // THEN both show the same sections
    await sameSectionsOnMobileAndDesktop(ERASRoles.PROFESSIONAL);
  });

  it('[671-home-and-recent-alerts-mobile/AC-7] shows an Officer the same sections on mobile and on desktop', async () => {
    // GIVEN an "ERAS Student Services Officer"
    // WHEN they open Home on a 375px and on a 1280px wide screen
    // THEN both show the same sections
    await sameSectionsOnMobileAndDesktop(ERASRoles.OFFICER);
  });

  it('[671-home-and-recent-alerts-mobile/AC-8] shows an Administrator the same sections on mobile and on desktop', async () => {
    // GIVEN an "ERAS Administrator"
    // WHEN they open Home on a 375px and on a 1280px wide screen
    // THEN both show the same sections
    await sameSectionsOnMobileAndDesktop(ERASRoles.ADMIN);
  });

  it('[671-home-and-recent-alerts-mobile/AC-9] keeps three summary columns and a two-column alerts block on a 1280px screen', async () => {
    // GIVEN a signed-in user on a 1280px wide screen
    // WHEN they open Home
    const host = await render(1280, ERASRoles.ADMIN);

    // THEN the three cards are in one row and the alerts block spans two of three columns
    const tops = Array.from(
      host.querySelectorAll<HTMLElement>('.grid-tile')
    ).map(t => t.getBoundingClientRect().top);
    expect(tops.length).toBe(3);
    expect(new Set(tops).size).toBe(1);
    const ratio =
      (
        host.querySelector('.recent-alerts') as HTMLElement
      ).getBoundingClientRect().width /
      (
        host.querySelector('.section-alerts-support') as HTMLElement
      ).getBoundingClientRect().width;
    expect(ratio).toBeGreaterThan(0.6);
    expect(ratio).toBeLessThan(0.7);
  });
});
