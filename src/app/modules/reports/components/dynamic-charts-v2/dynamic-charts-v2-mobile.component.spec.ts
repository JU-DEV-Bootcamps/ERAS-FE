import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component,
  Input,
  NO_ERRORS_SCHEMA,
  output,
  input,
  signal,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ApexAxisChartSeries,
  ApexOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { DynamicChartsV2Component } from './dynamic-charts-v2.component';
import { ReportService } from '@core/services/api/report.service';
import { HeatMapService } from '@core/services/api/heat-map.service';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { ViewportService } from '@core/services/layout/viewport.service';
import { DESKTOP_EXPORT_WIDTH } from '@modules/reports/components/summary-charts/constants/export-conf';
import { PollCountQuestion, PollCountReport } from '@core/models/summary.model';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import {
  DetailsPanelComponent,
  DetailsPanelData,
} from '@shared/components/panels/details-panel-v2/details-panel.component';

type HMSeriesReturn = ReturnType<
  ReportService['getHMSeriesFromCountComponent']
>;
type RegroupReturn = ReturnType<ReportService['regroupDynamicByColor']>;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'apx-chart',
  template: '',
  standalone: true,
})
class MockApxChartComponent {
  @Input() series: ApexAxisChartSeries = [];
  @Input() chart: ApexOptions['chart'] = { type: 'heatmap' };
  @Input() xaxis: ApexOptions['xaxis'] = {};
  @Input() yaxis: ApexOptions['yaxis'] = {};
  @Input() colors: ApexOptions['colors'] = [];
  @Input() plotOptions: ApexOptions['plotOptions'] = {};
  @Input() tooltip: ApexOptions['tooltip'] = {};
  @Input() legend: ApexOptions['legend'] = {};
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

const REPORT = {
  components: ['Ansiedad', 'Depresion'].map(name => ({
    description: name,
    text: name,
    questions: [{ question: 'Q', answers: [], averageRisk: 0, position: 0 }],
  })),
} as unknown as PollCountReport;

const QUESTION = {
  question: 'Q',
  answers: [],
  averageRisk: 0,
  position: 0,
} as unknown as PollCountQuestion;

describe('DynamicChartsV2Component on mobile and desktop screens', () => {
  let fixture: ComponentFixture<DynamicChartsV2Component>;
  let component: DynamicChartsV2Component;
  const isMobile = signal(true);
  const renderAsDesktop = signal(false);

  const setup = async (mobile: boolean, width: number) => {
    isMobile.set(mobile);
    const reportService = jasmine.createSpyObj<ReportService>('ReportService', [
      'getCountPoolReport',
      'getHMSeriesFromCountComponent',
      'regroupDynamicByColor',
    ]);
    reportService.getHMSeriesFromCountComponent.and.callFake(
      (c: unknown) =>
        [
          {
            name: (c as { description: string }).description,
            data: [{ x: 0, y: 0, count: 3, z: 'ok', totalFillers: 0 }],
          },
        ] as unknown as HMSeriesReturn
    );
    reportService.regroupDynamicByColor.and.callFake(
      (series: unknown) => series as RegroupReturn
    );

    await TestBed.configureTestingModule({
      imports: [DynamicChartsV2Component],
      providers: [
        { provide: ReportService, useValue: reportService },
        { provide: HeatMapService, useValue: {} },
        { provide: PdfHelper, useValue: {} },
        {
          provide: ViewportService,
          useValue: { isMobile, renderAsDesktop },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(DynamicChartsV2Component, {
        remove: { imports: [NgApexchartsModule, DetailsPanelComponent] },
        add: { imports: [MockApxChartComponent, StubDetailsPanelComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DynamicChartsV2Component);
    component = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    Object.assign((fixture.nativeElement as HTMLElement).style, {
      display: 'block',
      width: `${width}px`,
    });
    fixture.detectChanges();
    component.uuid = 'poll-uuid';
    component.components.set(REPORT);
    component.generateSeries(REPORT);
    fixture.detectChanges();
  };

  afterEach(() => fixture.nativeElement.remove());

  const host = () => fixture.nativeElement as HTMLElement;
  const grid = () => host().querySelector<HTMLElement>('.charts-grid')!;
  const cards = () =>
    Array.from(host().querySelectorAll<HTMLElement>('app-expandable-card'));
  const columnCount = () =>
    getComputedStyle(grid()).gridTemplateColumns.split(' ').length;
  const yaxisLabelStyle = () =>
    (component.chartsOptions[0].yaxis as { labels: { style?: unknown } }).labels
      .style;

  it('[674-improve-reports-charts-mobile-view/AC-21] keeps two chart columns, the 380px details beside the charts and the label sizes on 1280px', async () => {
    await setup(false, 1280);

    expect(cards().length).toBe(2);
    expect(columnCount()).toBe(2);
    expect(yaxisLabelStyle()).toBeUndefined();

    component.openDetailsModal(
      'poll-uuid',
      '1',
      QUESTION,
      'Ansiedad' as ComponentValueType
    );
    fixture.detectChanges();

    const aside = host().querySelector<HTMLElement>('.details-aside')!;
    expect(Math.round(aside.getBoundingClientRect().width)).toBe(380);
    expect(getComputedStyle(aside).position).not.toBe('fixed');
    expect(cards()[0].getBoundingClientRect().right).toBeLessThanOrEqual(
      aside.getBoundingClientRect().left + 1
    );
  });

  it('[674-improve-reports-charts-mobile-view/AC-3] shows the heatmap charts in one column with smaller labels on mobile', async () => {
    await setup(true, 375);

    const [first, second] = cards().map(card => card.getBoundingClientRect());
    expect(columnCount()).toBe(1);
    expect(second.top).toBeGreaterThanOrEqual(first.bottom - 1);
    expect(Math.round(first.width)).toBe(grid().clientWidth);
    expect(Math.round(second.width)).toBe(grid().clientWidth);
    expect(yaxisLabelStyle()).toEqual(
      jasmine.objectContaining({ fontSize: '10px' })
    );
    expect(host().scrollWidth).toBeLessThanOrEqual(host().clientWidth);
  });

  it('leaves space between the filters and the charts on mobile', async () => {
    await setup(true, 375);

    const filters = host()
      .querySelector('app-poll-filters')!
      .getBoundingClientRect();
    const charts = host()
      .querySelector('.charts-layout')!
      .getBoundingClientRect();

    expect(charts.top - filters.bottom).toBeGreaterThanOrEqual(16);
  });

  it('generates the charts at the desktop card width while a PDF is rendered as desktop', async () => {
    await setup(true, 375);

    renderAsDesktop.set(true);
    isMobile.set(false);
    component.generateSeries(REPORT);

    expect(component.chartsOptions[0].chart?.width).toBe(
      DESKTOP_EXPORT_WIDTH.card - 16
    );
  });

  it('[674-improve-reports-charts-mobile-view/AC-10] opens the dynamic details centered over the whole screen and closes back to the charts', async () => {
    await setup(true, 375);

    component.openDetailsModal(
      'poll-uuid',
      '1',
      QUESTION,
      'Ansiedad' as ComponentValueType
    );
    fixture.detectChanges();

    const aside = host().querySelector<HTMLElement>('.details-aside')!;
    const rect = aside.getBoundingClientRect();
    const viewport = document.documentElement;
    expect(getComputedStyle(aside).position).toBe('fixed');
    expect(Math.round(rect.left)).toBe(0);
    expect(Math.round(rect.top)).toBe(0);
    expect(Math.round(rect.width)).toBe(viewport.clientWidth);
    expect(Math.round(rect.height)).toBe(viewport.clientHeight);
    expect(Math.round(rect.left + rect.right)).toBe(viewport.clientWidth);
    expect(aside.querySelector('.close-btn')).not.toBeNull();
    expect(aside.scrollWidth).toBeLessThanOrEqual(aside.clientWidth);
    expect(host().scrollWidth).toBeLessThanOrEqual(host().clientWidth);
    expect(
      getComputedStyle(
        host().querySelector<HTMLElement>('.charts-area-wrapper')!
      ).display
    ).toBe('none');

    aside.querySelector<HTMLElement>('.close-btn')!.click();
    fixture.detectChanges();

    expect(host().querySelector('.details-aside')).toBeNull();
    expect(
      getComputedStyle(
        host().querySelector<HTMLElement>('.charts-area-wrapper')!
      ).display
    ).not.toBe('none');
  });
});
