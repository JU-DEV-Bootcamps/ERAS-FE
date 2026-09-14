import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryColumnChartsV2Component } from './summary-column-charts-v2.component';
import {
  AnswerDetail,
  PollAvgComponent,
  PollAvgQuestion,
  PollAvgReport,
} from '@core/models/summary.model';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { ColumnChartUtils } from '@modules/reports/utils/column-chart.config';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

interface ChartDataPoint {
  y: number;
  data: PollAvgQuestion[];
  meta: string[];
}

interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
}

type ChartSelectCallback = (
  x: number,
  y: number,
  series: ChartSeries[]
) => void;

type CustomTooltipFn = (opts: {
  seriesIndex: number;
  dataPointIndex: number;
  w: unknown;
}) => string;

describe('SummaryColumnChartsV2Component', () => {
  let component: SummaryColumnChartsV2Component;
  let fixture: ComponentFixture<SummaryColumnChartsV2Component>;
  let capturedOnSelect: ChartSelectCallback | undefined;

  const mockQuestions: PollAvgQuestion[] = [
    {
      question: 'Q1',
      averageRisk: 1.2, // Math.round => 1
      position: 1,
      answersDetails: [
        {
          studentsEmails: [
            'user1@test.com',
            'user2@test.com',
            'user1@test.com',
          ],
        } as unknown as AnswerDetail,
      ],
    } as unknown as PollAvgQuestion,
    {
      question: 'Q2',
      averageRisk: 2.8, // Math.round => 3
      position: 2,
      answersDetails: [
        {
          studentsEmails: ['user3@test.com'],
        } as unknown as AnswerDetail,
      ],
    } as unknown as PollAvgQuestion,
  ];

  const mockComponents: PollAvgComponent[] = [
    {
      description: 'ansiedad' as ComponentValueType,
      text: 'Ansiedad description',
      averageRisk: 1.5,
      questions: mockQuestions,
    } as unknown as PollAvgComponent,
  ];

  const mockReport: PollAvgReport = {
    components: mockComponents,
    pollCount: 2,
  };

  beforeEach(async () => {
    capturedOnSelect = undefined;
    spyOn(ColumnChartUtils, 'createChartBase').and.callFake(
      (onSelect: unknown) => {
        capturedOnSelect = onSelect as ChartSelectCallback;
        return { type: 'bar' } as unknown as ReturnType<
          typeof ColumnChartUtils.createChartBase
        >;
      }
    );

    await TestBed.configureTestingModule({
      imports: [SummaryColumnChartsV2Component],
      providers: [provideNoopAnimations()],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SummaryColumnChartsV2Component, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SummaryColumnChartsV2Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('chartOptions computed', () => {
    it('should return empty object when components input is undefined', () => {
      fixture.componentRef.setInput('components', undefined);
      fixture.detectChanges();

      expect(component.chartOptions()).toEqual({});
    });

    it('should build chart options when components input is provided', () => {
      fixture.componentRef.setInput('components', mockReport);
      fixture.componentRef.setInput('data', 'Report Title');
      fixture.detectChanges();

      const options = component.chartOptions();
      expect(options).toBeDefined();
      expect(options.title).toBeDefined();
      expect(options.series?.length).toBeGreaterThan(0);
      expect(options.xaxis?.categories).toEqual(['ansiedad']);
    });
  });

  describe('Series and Answer Risk Processing', () => {
    it('should properly group questions by rounded risk level and deduplicate emails', () => {
      fixture.componentRef.setInput('components', mockReport);
      fixture.detectChanges();

      const options = component.chartOptions();
      const series = options.series as unknown as ChartSeries[];

      const seriesRisk1 = series.find(s =>
        s.data[0]?.data.some((q: PollAvgQuestion) => q.question === 'Q1')
      );
      expect(seriesRisk1).toBeDefined();

      const dataPoint = seriesRisk1?.data[0];
      expect(dataPoint?.y).toBe(1);
      expect(dataPoint?.data).toEqual([mockQuestions[0]]);
      expect(dataPoint?.meta).toEqual(['user1@test.com', 'user2@test.com']);
    });
  });

  describe('openPanel emission (_emitPanelData)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('components', mockReport);
      fixture.componentRef.setInput('pollUuid', 'poll-123');
      fixture.componentRef.setInput('cohortsIds', [10, 20]);
      fixture.componentRef.setInput('evaluationId', 99);
      fixture.detectChanges();
    });

    it('should emit openPanel with correct data when onSelect is triggered with questions', () => {
      spyOn(component.openPanel, 'emit');

      const options = component.chartOptions();
      const series = options.series as unknown as ChartSeries[];
      const seriesIndex = series.findIndex(s => s.data[0]?.data.length > 0);

      expect(capturedOnSelect).toBeDefined();
      capturedOnSelect?.(0, seriesIndex, series);

      expect(component.openPanel.emit).toHaveBeenCalledWith({
        cohortIds: [10, 20],
        pollUuid: 'poll-123',
        componentName: 'ansiedad' as ComponentValueType,
        title: `${mockComponents[0].description}: ${series[seriesIndex].name} Details`,
        questions: [mockQuestions[0]],
        evaluationId: 99,
      });
    });

    it('should not emit openPanel if the selected group has no questions', () => {
      spyOn(component.openPanel, 'emit');

      const options = component.chartOptions();
      const series = options.series as unknown as ChartSeries[];
      const emptySeriesIndex = series.findIndex(
        s => s.data[0]?.data.length === 0
      );

      capturedOnSelect?.(0, emptySeriesIndex, series);

      expect(component.openPanel.emit).not.toHaveBeenCalled();
    });

    it('should not emit openPanel if pollUuid is missing', () => {
      spyOn(component.openPanel, 'emit');
      fixture.componentRef.setInput('pollUuid', undefined);
      fixture.detectChanges();

      const options = component.chartOptions();
      const series = options.series as unknown as ChartSeries[];
      const seriesIndex = series.findIndex(s => s.data[0]?.data.length > 0);

      capturedOnSelect?.(0, seriesIndex, series);

      expect(component.openPanel.emit).not.toHaveBeenCalled();
    });

    it('should not emit openPanel if cohortsIds is empty', () => {
      spyOn(component.openPanel, 'emit');
      fixture.componentRef.setInput('cohortsIds', []);
      fixture.detectChanges();

      const options = component.chartOptions();
      const series = options.series as unknown as ChartSeries[];
      const seriesIndex = series.findIndex(s => s.data[0]?.data.length > 0);

      capturedOnSelect?.(0, seriesIndex, series);

      expect(component.openPanel.emit).not.toHaveBeenCalled();
    });
  });

  describe('Tooltip Customization', () => {
    it('should generate custom HTML for tooltip using TooltipChartV2Component', () => {
      fixture.componentRef.setInput('components', mockReport);
      fixture.detectChanges();

      const options = component.chartOptions();
      const customTooltipFn = options.tooltip
        ?.custom as unknown as CustomTooltipFn;

      expect(customTooltipFn).toBeDefined();

      const mockW = {
        config: {
          series: [
            {
              data: [
                {
                  meta: ['user1@test.com', 'user2@test.com'],
                },
              ],
            },
          ],
        },
        globals: {
          labels: ['Ansiedad'],
        },
      };

      const resultHtml = customTooltipFn({
        seriesIndex: 0,
        dataPointIndex: 0,
        w: mockW,
      });

      expect(typeof resultHtml).toBe('string');
      expect(resultHtml).toContain('Students: 2');
      expect(resultHtml).toContain('Ansiedad');
    });
  });
});
