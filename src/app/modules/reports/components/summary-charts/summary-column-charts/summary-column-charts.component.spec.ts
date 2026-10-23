import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryColumnChartsComponent } from './summary-column-charts.component';
import {
  AnswerDetail,
  PollAvgComponent,
  PollAvgQuestion,
  PollAvgReport,
} from '@core/models/summary.model';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { ColumnChartUtils } from '@modules/reports/utils/column-chart.config';
import { ErasModalService } from '@shared/components/modals/eras-modal/eras-modal.service';
import RiskDetailsComponent from '../risk-details/risk-details.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

interface ChartDataPoint {
  x: string;
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

describe('SummaryColumnChartsComponent', () => {
  let component: SummaryColumnChartsComponent;
  let fixture: ComponentFixture<SummaryColumnChartsComponent>;
  let erasModalServiceSpy: jasmine.SpyObj<ErasModalService>;
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
    erasModalServiceSpy = jasmine.createSpyObj('ErasModalService', [
      'openComponent',
    ]);
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
      imports: [SummaryColumnChartsComponent],
      providers: [
        { provide: ErasModalService, useValue: erasModalServiceSpy },
        provideNoopAnimations(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SummaryColumnChartsComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SummaryColumnChartsComponent);
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

    it('should build chart options when components and data inputs are provided', () => {
      fixture.componentRef.setInput('components', mockReport);
      fixture.componentRef.setInput('data', 'Summary Report');
      fixture.detectChanges();

      const options = component.chartOptions();
      expect(options).toBeDefined();
      expect(options.title).toBeDefined();
      expect(options.series?.length).toBeGreaterThan(0);
      expect(options.xaxis?.categories).toEqual(['ansiedad']);
    });
  });

  describe('Series and Answer Risk Processing', () => {
    it('should properly group questions by rounded risk level and deduplicate emails in meta', () => {
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

  describe('_showRiskDetails onSelect handling', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('components', mockReport);
      fixture.componentRef.setInput('pollUuid', 'poll-123');
      fixture.componentRef.setInput('cohortsIds', [10, 20]);
      fixture.componentRef.setInput('evaluationId', 99);
      fixture.detectChanges();
    });

    it('should call erasModalService.openComponent with correct modalData when onSelect is triggered', () => {
      const options = component.chartOptions();
      const series = options.series as unknown as ChartSeries[];
      const seriesIndex = series.findIndex(s => s.data[0]?.data.length > 0);

      expect(capturedOnSelect).toBeDefined();
      capturedOnSelect?.(0, seriesIndex, series);

      expect(erasModalServiceSpy.openComponent).toHaveBeenCalledWith({
        component: RiskDetailsComponent,
        data: {
          riskGroup: series[seriesIndex].data[0],
          pollUuid: 'poll-123',
          cohorts: [10, 20],
          componentName: 'ansiedad',
          evaluationId: 99,
        },
        title: `ansiedad: ${series[seriesIndex].name} Details`,
      });
    });

    it('should fallback to empty string for componentName if components is not available', () => {
      const options = component.chartOptions();
      const series = options.series as unknown as ChartSeries[];

      fixture.componentRef.setInput('components', undefined);
      fixture.detectChanges();

      capturedOnSelect?.(0, 0, series);

      expect(erasModalServiceSpy.openComponent).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: `: ${series[0].name} Details`,
          data: jasmine.objectContaining({
            componentName: '',
          }),
        })
      );
    });
  });

  describe('Tooltip Customization', () => {
    it('should generate custom HTML for tooltip using TooltipChartComponent', () => {
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
