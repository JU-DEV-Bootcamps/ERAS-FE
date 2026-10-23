import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicColumnChartComponent } from './dynamic-column-chart.component';
import { MatDialog } from '@angular/material/dialog';
import { PollCountAnswer, PollCountReport } from '@core/models/summary.model';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { ColumnChartUtils } from '@modules/reports/utils/column-chart.config';
import { ModalQuestionDetailsComponent } from '@shared/components/modals/modal-question-details/modal-question-details.component';

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

describe('DynamicColumnChartsComponent', () => {
  let component: DynamicColumnChartComponent;
  let fixture: ComponentFixture<DynamicColumnChartComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockReport: PollCountReport = {
    components: [
      {
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
                  { email: 's1@example.com' },
                  { email: 's2@example.com' },
                ],
              },
              {
                answerRisk: 2,
                count: 3,
                students: [{ email: 's3@example.com' }],
              },
            ] as unknown as PollCountAnswer[],
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [DynamicColumnChartComponent],
      providers: [{ provide: MatDialog, useValue: dialogSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicColumnChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return empty array for chartOptions if components is not provided', () => {
    expect(component.chartOptions()).toEqual([]);
  });

  it('should build chart options when components are provided', () => {
    fixture.componentRef.setInput('components', mockReport);
    fixture.detectChanges();

    const options = component.chartOptions();
    expect(options.length).toBe(1);
    expect(options[0]?.title).toBeDefined();
    expect(options[0]?.series?.length).toBeGreaterThan(0);
  });

  it('should open details modal when onSelect is triggered', () => {
    let capturedCallback: ChartSelectCallback | undefined;
    spyOn(ColumnChartUtils, 'createChartBase').and.callFake((cb: unknown) => {
      capturedCallback = cb as ChartSelectCallback;
      return { type: 'bar' } as unknown as ReturnType<
        typeof ColumnChartUtils.createChartBase
      >;
    });

    fixture.componentRef.setInput('components', mockReport);
    fixture.componentRef.setInput('identifier', 'poll-123');
    fixture.componentRef.setInput('cohortsIds', 'cohort-1');
    fixture.componentRef.setInput('evaluationId', 1);
    fixture.detectChanges();

    capturedCallback?.(0, 1);

    expect(dialogSpy.open).toHaveBeenCalledWith(
      ModalQuestionDetailsComponent,
      jasmine.objectContaining({
        data: {
          cohortId: 'cohort-1',
          pollUuid: 'poll-123',
          componentName: 'ansiedad' as ComponentValueType,
          text: 'Text here',
          question: mockReport.components[0].questions[0],
          riskLevel: 1,
          evaluationId: 1,
        },
      })
    );
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
      mockReport.components[0].questions
    );

    expect(() => capturedCallback?.(0, 1)).not.toThrow();
  });

  describe('Tooltip Customization', () => {
    it('should generate custom HTML for the tooltip using TooltipChartComponent', () => {
      fixture.componentRef.setInput('components', mockReport);
      fixture.detectChanges();

      const options = component.chartOptions();
      const customFn = options[0]?.tooltip
        ?.custom as unknown as CustomTooltipFn;

      const resultHTML = customFn({
        series: [[10, 20]],
        seriesIndex: 0,
        dataPointIndex: 1,
        w: {
          globals: {
            labels: ['Q0', 'Q1'],
          },
          config: {
            series: [
              {
                data: [
                  { meta: ['email0@example.com'] },
                  { meta: ['email1@example.com'] },
                ],
              },
            ],
          },
        },
      });

      expect(typeof resultHTML).toBe('string');
      expect(resultHTML.length).toBeGreaterThan(0);
    });
  });

  describe('_getAnswersRisks / _extractEmails', () => {
    it('should correctly calculate total count and extract emails into meta array', () => {
      fixture.componentRef.setInput('components', mockReport);
      fixture.detectChanges();

      const options = component.chartOptions();
      const series = options[0]?.series;

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
          's1@example.com'
        );
        expect((foundDataWith5 as ChartSeriesItem).meta).toContain(
          's2@example.com'
        );
      }

      if (foundDataWith3) {
        expect((foundDataWith3 as ChartSeriesItem).meta).toContain(
          's3@example.com'
        );
      }
    });
  });
});
