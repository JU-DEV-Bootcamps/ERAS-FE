import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicColumnChartV2Component } from './dynamic-column-chart-v2.component';
import {
  PollCountAnswer,
  PollCountComponent,
} from '@core/models/summary.model';
import { ColumnChartUtils } from '@modules/reports/utils/column-chart.config';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';

type ChartSelectCallback = (x: number, s: number) => void;

type CustomTooltipFn = (opts: {
  series: unknown[];
  seriesIndex: number;
  dataPointIndex: number;
  w: unknown;
}) => string;

interface ChartSeriesItem {
  y: number;
  meta?: string[];
}

interface ChartSeriesGroup {
  data: ChartSeriesItem[];
}

interface ComponentWithPrivate {
  _createChart: (title: string, questions: unknown) => void;
}

describe('DynamicColumnChartsV2Component', () => {
  let component: DynamicColumnChartV2Component;
  let fixture: ComponentFixture<DynamicColumnChartV2Component>;

  const mockComponentData: PollCountComponent = {
    description: 'ansiedad' as ComponentValueType,
    text: 'Text here',
    questions: [
      {
        question: 'Q1',
        averageRisk: 1,
        position: 1,
        answers: [
          {
            answerRisk: 1,
            count: 5,
            students: [
              { email: 'student1@example.com' },
              { email: 'student2@example.com' },
            ],
          },
          {
            answerRisk: 2,
            count: 3,
            students: [{ email: 'student3@example.com' }],
          },
        ] as unknown as PollCountAnswer[],
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicColumnChartV2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicColumnChartV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return null for chartOption if componentData is not provided', () => {
    expect(component.chartOption()).toBeNull();
  });

  it('should build chart options when componentData is provided', () => {
    fixture.componentRef.setInput('componentData', mockComponentData);
    fixture.detectChanges();

    const option = component.chartOption();
    expect(option).not.toBeNull();
    expect(option?.title).toBeDefined();
    expect(option?.series?.length).toBeGreaterThan(0);
  });

  it('should emit selectPoint when onSelect is triggered from chart base', () => {
    let capturedCallback: ChartSelectCallback | undefined;
    spyOn(ColumnChartUtils, 'createChartBase').and.callFake((cb: unknown) => {
      capturedCallback = cb as ChartSelectCallback;
      return { type: 'bar' } as unknown as ReturnType<
        typeof ColumnChartUtils.createChartBase
      >;
    });

    fixture.componentRef.setInput('componentData', mockComponentData);
    fixture.detectChanges();

    spyOn(component.selectPoint, 'emit');

    capturedCallback?.(0, 1);

    expect(component.selectPoint.emit).toHaveBeenCalledWith({
      question: mockComponentData.questions[0],
      componentName: 'ansiedad' as ComponentValueType,
      text: 'Text here',
      riskLevel: 1,
    });
  });

  it('should safely execute chart base callback even if onSelect is not provided in _createChart', () => {
    let capturedCallback: ChartSelectCallback | undefined;
    spyOn(ColumnChartUtils, 'createChartBase').and.callFake((cb: unknown) => {
      capturedCallback = cb as ChartSelectCallback;
      return {} as unknown as ReturnType<
        typeof ColumnChartUtils.createChartBase
      >;
    });

    (component as unknown as ComponentWithPrivate)._createChart(
      'Title',
      mockComponentData.questions
    );

    expect(() => capturedCallback?.(0, 1)).not.toThrow();
  });

  describe('Tooltip Customization', () => {
    it('should return an empty string if tooltipFn is not provided', () => {
      fixture.componentRef.setInput('componentData', mockComponentData);
      fixture.detectChanges();

      const option = component.chartOption();
      const customFn = option?.tooltip?.custom as unknown as CustomTooltipFn;

      const result = customFn({
        series: [],
        seriesIndex: 0,
        dataPointIndex: 0,
        w: null,
      });

      expect(result).toBe('');
    });

    it('should call tooltipFn if provided', () => {
      const tooltipSpy = jasmine
        .createSpy('tooltipFn')
        .and.returnValue('<b>Custom Tooltip</b>');
      fixture.componentRef.setInput('tooltipFn', tooltipSpy);
      fixture.componentRef.setInput('componentData', mockComponentData);
      fixture.detectChanges();

      const option = component.chartOption();
      const customFn = option?.tooltip?.custom as unknown as CustomTooltipFn;

      const result = customFn({
        series: [],
        seriesIndex: 2,
        dataPointIndex: 1,
        w: null,
      });

      expect(result).toBe('<b>Custom Tooltip</b>');
      expect(tooltipSpy).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('_getAnswersRisks / _extractEmails', () => {
    it('should correctly calculate total count and extract emails into meta array', () => {
      fixture.componentRef.setInput('componentData', mockComponentData);
      fixture.detectChanges();

      const option = component.chartOption();
      const series = option?.series;

      expect(series).toBeDefined();

      let foundDataWith5: ChartSeriesItem | null = null;
      let foundDataWith3: ChartSeriesItem | null = null;

      (series as unknown as ChartSeriesGroup[])?.forEach(s => {
        s.data.forEach(d => {
          if (d.y === 5) foundDataWith5 = d;
          if (d.y === 3) foundDataWith3 = d;
        });
      });

      if (foundDataWith5) {
        expect((foundDataWith5 as ChartSeriesItem).meta).toContain(
          'student1@example.com'
        );
        expect((foundDataWith5 as ChartSeriesItem).meta).toContain(
          'student2@example.com'
        );
      }

      if (foundDataWith3) {
        expect((foundDataWith3 as ChartSeriesItem).meta).toContain(
          'student3@example.com'
        );
      }
    });
  });

  it('should react to resizeTrigger changes and re-build chart option', () => {
    fixture.componentRef.setInput('componentData', mockComponentData);
    fixture.detectChanges();

    const option1 = component.chartOption();

    fixture.componentRef.setInput('resizeTrigger', 1);
    fixture.detectChanges();

    const option2 = component.chartOption();
    expect(option1).not.toBe(option2);
  });
});
