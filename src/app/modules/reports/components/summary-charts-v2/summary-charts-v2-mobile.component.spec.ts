import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component,
  Input,
  NO_ERRORS_SCHEMA,
  input,
  output,
  signal,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import {
  ApexAxisChartSeries,
  ApexOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { SummaryChartsV2Component } from './summary-charts-v2.component';
import {
  ColumnRiskPanelComponent,
  ColumnRiskPanelData,
} from './column-risk-panel/column-risk-panel.component';
import { ReportService } from '@core/services/api/report.service';
import { StudentService } from '@core/services/api/student.service';
import { CohortService } from '@core/services/api/cohort.service';
import { PollService } from '@core/services/api/poll.service';
import { EvaluationsService } from '@core/services/api/evaluations.service';
import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { ViewportService } from '@core/services/layout/viewport.service';
import {
  GetQueryResponse,
  PollAvgQuestion,
  PollAvgReport,
} from '@core/models/summary.model';
import {
  DetailsPanelComponent,
  DetailsPanelData,
} from '@shared/components/panels/details-panel-v2/details-panel.component';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';

type ObsType<T> = T extends Observable<infer U> ? U : unknown;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'apx-chart',
  template: '',
  standalone: true,
})
class MockApxChartComponent {
  @Input() dataLabels: ApexOptions['dataLabels'] = {};
  @Input() series: ApexAxisChartSeries = [];
  @Input() chart: ApexOptions['chart'] = { type: 'heatmap' };
  @Input() xaxis: ApexOptions['xaxis'] = {};
  @Input() yaxis: ApexOptions['yaxis'] = {};
  @Input() colors: ApexOptions['colors'] = [];
  @Input() plotOptions: ApexOptions['plotOptions'] = {};
  @Input() tooltip: ApexOptions['tooltip'] = {};
  @Input() title: ApexOptions['title'] = {};
}

@Component({
  selector: 'app-details-panel',
  standalone: true,
  template: '<button class="close-btn" (click)="closed.emit()">close</button>',
})
class StubDetailsPanelComponent {
  data = input<DetailsPanelData | null>();
  closed = output<void>();
}

@Component({
  selector: 'app-column-risk-panel',
  standalone: true,
  template: '<button class="close-btn" (click)="closed.emit()">close</button>',
})
class StubColumnRiskPanelComponent {
  data = input<ColumnRiskPanelData | null>();
  closed = output<void>();
}

const QUESTION = {
  question: 'How is your income?',
  averageRisk: 2,
  position: 1,
} as unknown as PollAvgQuestion;

const REPORT = {
  components: [{ description: 'Socioeconomic', averageRisk: 2, questions: [] }],
  pollCount: 10,
} as unknown as PollAvgReport;

describe('SummaryChartsV2Component on mobile and desktop screens', () => {
  let fixture: ComponentFixture<SummaryChartsV2Component>;
  let component: SummaryChartsV2Component;
  const isMobile = signal(true);

  const setup = async (mobile: boolean, width: number) => {
    isMobile.set(mobile);
    const reportService = jasmine.createSpyObj<ReportService>('ReportService', [
      'getAvgPoolReport',
      'getHMSeriesFromAvgReport',
      'regroupSummaryByColor',
    ]);
    reportService.getAvgPoolReport.and.returnValue(
      of({ status: '200', body: REPORT } as GetQueryResponse<PollAvgReport>)
    );
    reportService.getHMSeriesFromAvgReport.and.returnValue([
      {
        name: 'Socioeconomic',
        data: [{ x: 'How is your income?', y: 2, z: [] }],
      },
    ] as unknown as ReturnType<ReportService['getHMSeriesFromAvgReport']>);
    reportService.regroupSummaryByColor.and.callFake(
      series => series as ReturnType<ReportService['regroupSummaryByColor']>
    );

    const studentService = jasmine.createSpyObj<StudentService>(
      'StudentService',
      ['getAllAverageByCohortsAndPoll']
    );
    studentService.getAllAverageByCohortsAndPoll.and.returnValue(
      of({
        items: [
          {
            studentId: 1,
            studentName: 'Ana Torres',
            email: 'ana@example.com',
            avgRiskLevel: 3.25,
          },
        ],
        count: 1,
      })
    );

    const evaluationsService = jasmine.createSpyObj<EvaluationsService>(
      'EvaluationsService',
      ['getAllEvalProc']
    );
    evaluationsService.getAllEvalProc.and.returnValue(
      of({ count: 0, items: [] } as unknown as ObsType<
        ReturnType<EvaluationsService['getAllEvalProc']>
      >)
    );

    await TestBed.configureTestingModule({
      imports: [SummaryChartsV2Component],
      providers: [
        { provide: ReportService, useValue: reportService },
        { provide: StudentService, useValue: studentService },
        {
          provide: CohortService,
          useValue: jasmine.createSpyObj<CohortService>('CohortService', [
            'getCohorts',
          ]),
        },
        {
          provide: PollService,
          useValue: jasmine.createSpyObj<PollService>('PollService', [
            'getVariablesByComponents',
          ]),
        },
        { provide: EvaluationsService, useValue: evaluationsService },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(
            'FeatureFlagsService',
            ['isEnabled']
          ),
        },
        { provide: PdfHelper, useValue: {} },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj<MatDialog>('MatDialog', ['open']),
        },
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']),
        },
        {
          provide: ViewportService,
          useValue: { isMobile, renderAsDesktop: signal(false) },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SummaryChartsV2Component, {
        remove: {
          imports: [
            NgApexchartsModule,
            DetailsPanelComponent,
            ColumnRiskPanelComponent,
          ],
        },
        add: {
          imports: [
            MockApxChartComponent,
            StubDetailsPanelComponent,
            StubColumnRiskPanelComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SummaryChartsV2Component);
    component = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    Object.assign((fixture.nativeElement as HTMLElement).style, {
      display: 'block',
      width: `${width}px`,
    });
    fixture.detectChanges();
    component.handleFilterSelect({
      title: 'Poll',
      uuid: 'poll-uuid',
      cohortIds: [1],
      variableIds: [],
      lastVersion: true,
      evaluationId: 1,
      selectedComponents: ['Socioeconomic'],
    });
    fixture.detectChanges();
  };

  afterEach(() => fixture.nativeElement.remove());

  const host = () => fixture.nativeElement as HTMLElement;
  const heatmap = () =>
    fixture.debugElement.query(By.directive(MockApxChartComponent))
      .componentInstance as MockApxChartComponent;
  const yaxisLabelStyle = () =>
    (heatmap().yaxis as { labels?: { style?: unknown } } | undefined)?.labels
      ?.style;

  it('[674-improve-reports-charts-mobile-view/AC-22] keeps the filters in a row, the 440px details beside the report and the student table on 1280px', async () => {
    await setup(false, 1280);

    const filters = Array.from(
      host().querySelectorAll<HTMLElement>(
        'app-poll-filters .form-container > *'
      )
    );
    expect(filters.length).toBeGreaterThan(1);
    const firstFilter = filters[0].getBoundingClientRect();
    filters.slice(1).forEach(item => {
      const rect = item.getBoundingClientRect();
      expect(Math.abs(rect.top - firstFilter.top)).toBeLessThanOrEqual(8);
      expect(rect.left).toBeGreaterThan(firstFilter.left);
    });
    expect(yaxisLabelStyle()).toBeUndefined();
    expect(heatmap().dataLabels).toBeUndefined();
    expect(
      getComputedStyle(host().querySelector<HTMLElement>('.heatmap-scroll')!)
        .overflowX
    ).toBe('visible');
    expect(host().querySelector('app-list table')).not.toBeNull();
    expect(host().querySelector('app-list mat-card')).toBeNull();

    component.openDetailsPanel(
      QUESTION,
      'Socioeconomic' as ComponentValueType,
      'Socioeconomic'
    );
    fixture.detectChanges();

    const aside = host().querySelector<HTMLElement>('.details-aside')!;
    const content = host().querySelector<HTMLElement>('.summary-content')!;
    expect(Math.round(aside.getBoundingClientRect().width)).toBe(440);
    expect(getComputedStyle(aside).position).not.toBe('fixed');
    expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(
      aside.getBoundingClientRect().left + 1
    );
  });

  it('[674-improve-reports-charts-mobile-view/AC-6] fits the summary heatmap and its legend with smaller component names on mobile', async () => {
    await setup(true, 375);

    const hostRect = host().getBoundingClientRect();
    const chartArea = host().querySelector<HTMLElement>('.chart-area')!;
    const legendItems = Array.from(
      host().querySelectorAll<HTMLElement>('.chart-legend__item')
    );

    expect(yaxisLabelStyle()).toEqual(
      jasmine.objectContaining({ fontSize: '10px' })
    );
    expect(heatmap().dataLabels).toEqual({ enabled: false });
    const scroller = host().querySelector<HTMLElement>('.heatmap-scroll')!;
    const inner = scroller.querySelector<HTMLElement>('.heatmap-inner')!;
    expect(getComputedStyle(scroller).overflowX).toBe('auto');
    expect(inner.getBoundingClientRect().width).toBeGreaterThanOrEqual(640);
    expect(scroller.getBoundingClientRect().right).toBeLessThanOrEqual(
      hostRect.right + 1
    );
    expect(legendItems.length).toBe(6);
    [chartArea, ...legendItems].forEach(element => {
      const rect = element.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(hostRect.left - 1);
      expect(rect.right).toBeLessThanOrEqual(hostRect.right + 1);
    });
    expect(host().scrollWidth).toBeLessThanOrEqual(host().clientWidth);
  });

  it('[674-improve-reports-charts-mobile-view/AC-8] shows each student answer as a card with the average risk badge on mobile', async () => {
    await setup(true, 375);

    const cards = Array.from(
      host().querySelectorAll<HTMLElement>('.report-card--students mat-card')
    );
    expect(cards.length).toBe(1);
    expect(host().querySelector('.report-card--students table')).toBeNull();
    expect(cards[0].textContent).toContain('Ana Torres');
    expect(cards[0].textContent).toContain('ana@example.com');
    expect(cards[0].querySelector('.risk-badge')?.textContent?.trim()).toBe(
      '3.25'
    );
    expect(host().scrollWidth).toBeLessThanOrEqual(host().clientWidth);
  });

  const expectScreenOfItsOwn = (aside: HTMLElement) => {
    const viewport = document.documentElement;
    const rect = aside.getBoundingClientRect();
    expect(getComputedStyle(aside).position).toBe('fixed');
    expect(Math.round(rect.left)).toBe(0);
    expect(Math.round(rect.top)).toBe(0);
    expect(Math.round(rect.width)).toBe(viewport.clientWidth);
    expect(Math.round(rect.height)).toBe(viewport.clientHeight);
    const close = aside
      .querySelector<HTMLElement>('.close-btn')!
      .getBoundingClientRect();
    expect(close.width).toBeGreaterThan(0);
    expect(close.top).toBeGreaterThanOrEqual(0);
    expect(close.top).toBeLessThan(rect.top + 100);
    expect(aside.scrollWidth).toBeLessThanOrEqual(aside.clientWidth);
    ['.filter-bar', '.summary-content'].forEach(selector =>
      expect(
        getComputedStyle(host().querySelector<HTMLElement>(selector)!).display
      ).toBe('none')
    );
  };

  const expectReportVisible = () => {
    expect(host().querySelector('.details-aside')).toBeNull();
    ['.filter-bar', '.summary-content'].forEach(selector =>
      expect(
        getComputedStyle(host().querySelector<HTMLElement>(selector)!).display
      ).not.toBe('none')
    );
  };

  it('[674-improve-reports-charts-mobile-view/AC-11] opens the heatmap details as a screen of their own and closes back to the report', async () => {
    await setup(true, 375);

    component.openDetailsPanel(
      QUESTION,
      'Socioeconomic' as ComponentValueType,
      'Socioeconomic'
    );
    fixture.detectChanges();

    const aside = host().querySelector<HTMLElement>('.details-aside')!;
    expectScreenOfItsOwn(aside);

    aside.querySelector<HTMLElement>('.close-btn')!.click();
    fixture.detectChanges();
    expectReportVisible();
  });

  it('[674-improve-reports-charts-mobile-view/AC-12] opens the column details as a screen of their own and closes back to the report', async () => {
    await setup(true, 375);

    component.openPanelFromColumn({
      cohortIds: [1],
      pollUuid: 'poll-uuid',
      componentName: 'Socioeconomic' as ComponentValueType,
      title: 'Socioeconomic: Medium Details',
      questions: [QUESTION],
    } as unknown as ColumnRiskPanelData);
    fixture.detectChanges();

    const aside = host().querySelector<HTMLElement>('.details-aside')!;
    expectScreenOfItsOwn(aside);

    aside.querySelector<HTMLElement>('.close-btn')!.click();
    fixture.detectChanges();
    expectReportVisible();
  });

  it('uses the tooltip directive on the heatmap only on a mobile screen', async () => {
    const hoverCell = () => {
      const chartArea = host().querySelector<HTMLElement>('.chart-area')!;
      const cell = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      );
      cell.setAttribute('class', 'apexcharts-heatmap-rect');
      cell.setAttribute('i', '0');
      cell.setAttribute('j', '0');
      chartArea.querySelector('apx-chart')!.appendChild(cell);
      cell.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 50,
          clientY: 300,
        })
      );
      return document.querySelector('.apex-cdk-tooltip');
    };

    await setup(true, 375);
    expect(hoverCell()).not.toBeNull();
    fixture.nativeElement.remove();
    TestBed.resetTestingModule();

    await setup(false, 1280);
    expect(hoverCell()).toBeNull();
  });

  it('gives the heatmap the same option objects on every change detection pass', async () => {
    await setup(true, 375);

    expect(component.heatmapYaxis).toBe(component.heatmapYaxis);
    expect(component.heatmapDataLabels).toBe(component.heatmapDataLabels);
  });

  it('returns an empty tooltip when the heatmap data point no longer exists', async () => {
    await setup(true, 375);

    expect(component.heatmapTooltip(9, 9)).toBe('');
  });
});
