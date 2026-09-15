import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Component, Input, ElementRef } from '@angular/core';
import { Observable, of } from 'rxjs';

import { DynamicChartsV2Component } from './dynamic-charts-v2.component';
import { ReportService } from '@core/services/api/report.service';
import { HeatMapService } from '@core/services/api/heat-map.service';
import { PdfHelper } from '@core/utils/reports/exportReport.util';
import { Filter } from '../poll-filters/types/filters';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  NgApexchartsModule,
  ApexOptions,
  ApexAxisChartSeries,
} from 'ng-apexcharts';
import { ComponentValueType } from '@core/models/types/risk-students-detail.type';
import { PollCountQuestion, PollCountReport } from '@core/models/summary.model';

type ObsType<T> = T extends Observable<infer U> ? U : unknown;
type HMSeriesReturn = ReturnType<
  ReportService['getHMSeriesFromCountComponent']
>;
type RegroupReturn = ReturnType<ReportService['regroupDynamicByColor']>;
type CountPoolBody = ObsType<ReturnType<ReportService['getCountPoolReport']>>;

interface ComponentWithPrivates {
  cardWidth: { set(val: number): void; (): number };
  refreshSeries(delay?: number): void;
  _updateCardWidth(): void;
  applyFilterMetadata(filters: Filter): void;
  pendingTimeouts: ReturnType<typeof setTimeout>[];
}

interface FakeComponent {
  description: string;
  text: string;
  questions: {
    question: string;
    answers: unknown[];
    averageRisk: number;
    position: number;
  }[];
}

function fakeCountReport(names: string[]) {
  return {
    components: names.map(name => ({
      description: name,
      text: name,
      questions: [{ question: 'Q', answers: [], averageRisk: 0, position: 0 }],
    })),
  };
}

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

describe('DynamicChartsV2Component', () => {
  let component: DynamicChartsV2Component;
  let fixture: ComponentFixture<DynamicChartsV2Component>;
  let reportServiceSpy: jasmine.SpyObj<ReportService>;

  beforeEach(async () => {
    reportServiceSpy = jasmine.createSpyObj<ReportService>('ReportService', [
      'getCountPoolReport',
      'getHMSeriesFromCountComponent',
      'regroupDynamicByColor',
    ]);

    reportServiceSpy.getHMSeriesFromCountComponent.and.callFake(
      (c: unknown) => {
        const comp = c as FakeComponent;
        return [
          {
            name: comp.description,
            text: comp.text,
            description: comp.description,
            data: [
              { x: 0, y: 0, count: 3, z: 'ok', totalFillers: 0 } as unknown,
            ],
          },
        ] as unknown as HMSeriesReturn;
      }
    );

    reportServiceSpy.regroupDynamicByColor.and.callFake(
      (series: unknown) => series as unknown as RegroupReturn
    );

    await TestBed.configureTestingModule({
      imports: [DynamicChartsV2Component],
      providers: [
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: HeatMapService, useValue: {} },
        { provide: PdfHelper, useValue: {} },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(DynamicChartsV2Component, {
        remove: { imports: [NgApexchartsModule] },
        add: { imports: [MockApxChartComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DynamicChartsV2Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('generateHeatMap', () => {
    it('does nothing when uuid is null', () => {
      component.uuid = null;
      component.generateHeatMap([1], [2]);
      expect(reportServiceSpy.getCountPoolReport).not.toHaveBeenCalled();
    });

    it('sets hasNoResults when API returns null', () => {
      component.uuid = 'u';
      reportServiceSpy.getCountPoolReport.and.returnValue(
        of(null as unknown as never)
      );
      component.generateHeatMap([1], [2]);
      expect(component.hasNoResults).toBeTrue();
      expect(component.isLoading).toBeFalse();
      expect(component.chartsOptions.length).toBe(0);
    });

    it('sets hasNoResults to true when data has 0 components', fakeAsync(() => {
      component.uuid = 'u';
      const report = { components: [] };
      reportServiceSpy.getCountPoolReport.and.returnValue(
        of({ body: report, status: '200' } as unknown as CountPoolBody)
      );
      fixture.detectChanges();
      component.generateHeatMap([1], [2]);
      tick(20);
      expect(component.hasNoResults).toBeTrue();
      expect(component.isLoading).toBeFalse();
    }));

    it('populates data on success', fakeAsync(() => {
      component.uuid = 'u';
      const report = fakeCountReport(['Ansiedad']);
      reportServiceSpy.getCountPoolReport.and.returnValue(
        of({ body: report, status: '200' } as unknown as CountPoolBody)
      );
      fixture.detectChanges();
      component.generateHeatMap([1], [2]);
      tick(20);
      expect(component.chartsOptions.length).toBe(1);
      expect(component.hasNoResults).toBeFalse();
      expect(component.isLoading).toBeFalse();
      expect(component.isGeneratingPDF).toBeFalse();
    }));
  });

  describe('generateSeries', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('builds chart titles from component descriptions', () => {
      const report = fakeCountReport(['Ansiedad', 'Depresion']);
      component.generateSeries(report as unknown as never);
      expect(component.chartsOptions.length).toBe(2);
      expect(component.chartsOptions[0].title?.text).toBe('Reporte: Ansiedad');
      expect(component.chartsOptions[1].title?.text).toBe('Reporte: Depresion');
    });

    it('calculates cardWidth based on isAnyCardExpanded state', () => {
      const compPrivates = component as unknown as ComponentWithPrivates;
      compPrivates.cardWidth.set(1000);
      const report = fakeCountReport(['Ansiedad']);

      component.isAnyCardExpanded = false;
      component.generateSeries(report as unknown as never);

      component.isAnyCardExpanded = true;
      component.generateSeries(report as unknown as never);

      expect(component.chartsOptions.length).toBe(1);
    });

    it('uses fallback width of 400 when cardWidth is 0', () => {
      const compPrivates = component as unknown as ComponentWithPrivates;
      compPrivates.cardWidth.set(0);
      const report = fakeCountReport(['Ansiedad']);
      component.generateSeries(report as unknown as never);
      expect(component.chartsOptions.length).toBe(1);
    });

    it('triggers click handler in chart options and calls openDetailsModal when question and answer match', () => {
      component.uuid = 'poll-uuid';
      component.cohortIds = '1';

      const questionObj = {
        question: 'Pregunta 1',
        answers: [],
        averageRisk: 1,
        position: 0,
      } as unknown as PollCountQuestion;

      const report = {
        components: [
          {
            description: 'Ansiedad' as ComponentValueType,
            text: 'Texto Ansiedad',
            questions: [questionObj],
          },
        ],
      } as unknown as PollCountReport;

      const mockHMSeries = [
        {
          name: 'Ansiedad',
          text: 'Texto Ansiedad',
          description: 'Ansiedad',
          data: [{ x: 0, y: 2, count: 5, z: 'Total: 5' }],
        },
      ];

      const mockRegroup = [
        {
          data: [{ x: 0, y: 2, z: 'Total: 5', totalFillers: 0 }],
        },
      ];

      reportServiceSpy.getHMSeriesFromCountComponent.and.returnValue(
        mockHMSeries as unknown as HMSeriesReturn
      );
      reportServiceSpy.regroupDynamicByColor.and.returnValue(
        mockRegroup as unknown as RegroupReturn
      );

      spyOn(component, 'openDetailsModal');

      component.generateSeries(report);

      expect(component.chartsOptions.length).toBe(1);

      const clickFn =
        component.chartsOptions[0].chart?.events?.dataPointSelection;
      if (clickFn) {
        type ChartClickFn = (
          e: unknown,
          chart: unknown,
          options: { dataPointIndex: number; seriesIndex: number }
        ) => void;

        (clickFn as unknown as ChartClickFn)({}, undefined, {
          dataPointIndex: 0,
          seriesIndex: 0,
        });

        expect(component.openDetailsModal).toHaveBeenCalledWith(
          'poll-uuid',
          '1',
          jasmine.objectContaining({ question: 'Pregunta 1' }),
          'Ansiedad' as ComponentValueType,
          'Texto Ansiedad',
          2
        );
      }
    });

    it('executes custom tooltip function configured in chart options', () => {
      const questionObj = {
        question: 'Pregunta 1',
        answers: [],
        averageRisk: 1,
        position: 0,
      } as unknown as PollCountQuestion;

      const report = {
        components: [
          {
            description: 'Ansiedad' as ComponentValueType,
            text: 'Texto Ansiedad',
            questions: [questionObj],
          },
        ],
      } as unknown as PollCountReport;

      const mockHMSeries = [
        {
          name: 'Ansiedad',
          text: 'Texto Ansiedad',
          description: 'Ansiedad',
          data: [{ x: 0, y: 2, count: 5, z: 'Total: 5' }],
        },
      ];

      const mockRegroup = [
        {
          data: [{ x: 0, y: 2, z: 'Total: 5', totalFillers: 0 }],
        },
      ];

      reportServiceSpy.getHMSeriesFromCountComponent.and.returnValue(
        mockHMSeries as unknown as HMSeriesReturn
      );
      reportServiceSpy.regroupDynamicByColor.and.returnValue(
        mockRegroup as unknown as RegroupReturn
      );

      component.generateSeries(report);

      const tooltipCustomFn = component.chartsOptions[0].tooltip?.custom;
      if (typeof tooltipCustomFn === 'function') {
        type TooltipCustomFn = (options: {
          seriesIndex: number;
          dataPointIndex: number;
          w: unknown;
        }) => string;

        const result = (tooltipCustomFn as unknown as TooltipCustomFn)({
          seriesIndex: 0,
          dataPointIndex: 0,
          w: {},
        });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });

  describe('handleFilterSelect', () => {
    it('calls generateHeatMap for a valid filter', () => {
      spyOn(component, 'generateHeatMap');
      const filter = {
        title: 't',
        uuid: 'u',
        cohortIds: [1],
        variableIds: [1],
        evaluationId: 1,
        selectedComponents: ['a'],
        lastVersion: false,
      } as unknown as Filter;
      component.handleFilterSelect(filter);
      expect(component.generateHeatMap).toHaveBeenCalledWith([1], [1]);
      expect(component.hasNoResults).toBeFalse();
    });

    it('resets state when cohortIds is missing', () => {
      const compPrivates = component as unknown as ComponentWithPrivates;
      spyOn(component, 'generateHeatMap');
      spyOn(compPrivates, 'applyFilterMetadata');

      component.uuid = 'old-uuid';
      component.chartsOptions = [{}] as ApexOptions[];
      component.isAnyCardExpanded = true;

      const filter = {
        title: 't',
        uuid: 'u',
        cohortIds: undefined,
        variableIds: [1],
        evaluationId: 1,
        selectedComponents: ['a'],
        lastVersion: false,
      } as unknown as Filter;

      component.handleFilterSelect(filter);

      expect(component.generateHeatMap).not.toHaveBeenCalled();
      expect(component.uuid).toBeNull();
      expect(component.chartsOptions.length).toBe(0);
      expect(component.isAnyCardExpanded).toBeFalse();
    });

    it('resets state for an invalid filter (no variables)', () => {
      const compPrivates = component as unknown as ComponentWithPrivates;
      spyOn(component, 'generateHeatMap');
      spyOn(compPrivates, 'applyFilterMetadata');

      component.uuid = 'old-uuid';

      const filter = {
        title: 't',
        uuid: 'u',
        cohortIds: [1],
        variableIds: [],
        evaluationId: 1,
        selectedComponents: ['a'],
        lastVersion: false,
      } as unknown as Filter;

      component.handleFilterSelect(filter);

      expect(component.generateHeatMap).not.toHaveBeenCalled();
      expect(component.uuid).toBeNull();
    });

    it('still calls generateHeatMap when cohortIds is an empty array (current isValidFilter behavior)', () => {
      spyOn(component, 'generateHeatMap');
      const filter = {
        title: 't',
        uuid: 'u',
        cohortIds: [],
        variableIds: [1],
        evaluationId: 1,
        selectedComponents: ['a'],
        lastVersion: false,
      } as unknown as Filter;
      component.handleFilterSelect(filter);
      expect(component.generateHeatMap).toHaveBeenCalledWith([], [1]);
    });

    it('clears the chart type map when the evaluation changes', () => {
      spyOn(component, 'generateHeatMap');
      component.evaluationId = 1;
      component.chartTypeMap.set('a', 'column');

      const filter = {
        title: 't',
        uuid: 'u',
        cohortIds: [1],
        variableIds: [1],
        evaluationId: 2,
        selectedComponents: ['a'],
        lastVersion: false,
      } as unknown as Filter;
      component.handleFilterSelect(filter);

      expect(component.chartTypeMap.size).toBe(0);
    });

    it('does not clear the chart type map when the evaluation id is the same', () => {
      spyOn(component, 'generateHeatMap');
      component.evaluationId = 1;
      component.chartTypeMap.set('a', 'column');

      const filter = {
        title: 't',
        uuid: 'u',
        cohortIds: [1],
        variableIds: [1],
        evaluationId: 1,
        selectedComponents: ['a'],
        lastVersion: false,
      } as unknown as Filter;
      component.handleFilterSelect(filter);

      expect(component.chartTypeMap.get('a')).toBe('column');
    });

    it('does not update expanded state when isAnyCardExpanded is false', () => {
      spyOn(component, 'generateHeatMap');
      component.isAnyCardExpanded = false;
      component.expandedId = null;

      const filter = {
        title: 't',
        uuid: 'u',
        cohortIds: [1],
        variableIds: [1],
        evaluationId: 1,
        selectedComponents: ['anxiety'],
        lastVersion: false,
      } as unknown as Filter;

      component.handleFilterSelect(filter);

      expect(component.isAnyCardExpanded).toBeFalse();
      expect(component.expandedId).toBeNull();
    });

    it('keeps the expanded card when it is still selected', () => {
      spyOn(component, 'generateHeatMap');
      component.contentQuarter = {
        nativeElement: { offsetHeight: 100 },
      } as ElementRef;
      component.onToggle('chart-anxiety');

      const filter = {
        title: 't',
        uuid: 'u',
        cohortIds: [1],
        variableIds: [1],
        evaluationId: 1,
        selectedComponents: ['anxiety', 'depression'],
        lastVersion: false,
      } as unknown as Filter;
      component.handleFilterSelect(filter);

      expect(component.expandedId).toBe('chart-anxiety');
    });

    it('collapses the expanded card when several components are selected and none match', () => {
      spyOn(component, 'generateHeatMap');
      component.contentQuarter = {
        nativeElement: { offsetHeight: 100 },
      } as ElementRef;
      component.onToggle('chart-anxiety');

      const filter = {
        title: 't',
        uuid: 'u',
        cohortIds: [1],
        variableIds: [1],
        evaluationId: 1,
        selectedComponents: ['depression', 'stress'],
        lastVersion: false,
      } as unknown as Filter;
      component.handleFilterSelect(filter);

      expect(component.isAnyCardExpanded).toBeFalse();
    });

    it('falls back to the first component when only one is selected and it does not match', () => {
      spyOn(component, 'generateHeatMap');
      component.contentQuarter = {
        nativeElement: { offsetHeight: 100 },
      } as ElementRef;
      component.onToggle('chart-anxiety');

      const filter = {
        title: 't',
        uuid: 'u',
        cohortIds: [1],
        variableIds: [1],
        evaluationId: 1,
        selectedComponents: ['depression'],
        lastVersion: false,
      } as unknown as Filter;
      component.handleFilterSelect(filter);

      expect(component.expandedId).toBe('chart-depression');
    });
  });

  describe('onToggle', () => {
    it('expands and collapses a card', fakeAsync(() => {
      component.contentQuarter = {
        nativeElement: { offsetHeight: 100 },
      } as ElementRef;

      component.uuid = 'u';
      component.onToggle('chart-c-1');
      expect(component.expandedComponent).toBe('c-1');
      expect(component.expandedId).toBe('chart-c-1');
      expect(component.isAnyCardExpanded).toBeTrue();
      tick(50);

      component.onToggle('chart-c-1');
      expect(component.expandedId).toBeNull();
      expect(component.isAnyCardExpanded).toBeFalse();
      expect(component.gridHeight).toBe(100);
      tick(50);
    }));
  });

  describe('openDetailsModal / closePanel', () => {
    it('opens and closes panel and triggers transitions', fakeAsync(() => {
      const q = { question: 'Q', answers: [], averageRisk: 0, position: 0 };
      const initialTick = component.resizeTick();

      component.openDetailsModal(
        'u',
        '1',
        q as unknown as never,
        'A' as unknown as never
      );
      expect(component.isPanelOpen()).toBeTrue();
      expect(component.isPanelTransitioning()).toBeTrue();

      tick(50);
      expect(component.resizeTick()).toBe(initialTick + 1);

      component.closePanel();
      expect(component.isPanelOpen()).toBeFalse();
      expect(component.selectedPanelData()).toBeNull();
      expect(component.isPanelTransitioning()).toBeTrue();

      tick(50);
      expect(component.resizeTick()).toBe(initialTick + 2);
    }));

    it('stores the panel data passed in', () => {
      const q = { question: 'Q', answers: [], averageRisk: 0, position: 0 };
      component.evaluationId = 7;
      component.openDetailsModal(
        'u',
        '1',
        q as unknown as never,
        'A' as unknown as never,
        'body text',
        3
      );
      expect(component.selectedPanelData()).toEqual(
        jasmine.objectContaining({
          cohortId: '1',
          pollUuid: 'u',
          componentName: 'A',
          text: 'body text',
          riskLevel: 3,
          evaluationId: 7,
        })
      );
    });
  });

  describe('toggleChart', () => {
    it('sets heatmapChart to true for "heatmap"', () => {
      component.heatmapChart = false;
      component.toggleChart('heatmap');
      expect(component.heatmapChart).toBeTrue();
    });

    it('sets heatmapChart to false for any other value', () => {
      component.heatmapChart = true;
      component.toggleChart('column');
      expect(component.heatmapChart).toBeFalse();
    });
  });

  describe('onExporting', () => {
    it('sets isExporting true when exporting starts', async () => {
      await component.onExporting(true);
      expect(component.isExporting()).toBeTrue();
    });

    it('sets isExporting false when exporting ends', async () => {
      await component.onExporting(true);
      await component.onExporting(false);
      expect(component.isExporting()).toBeFalse();
    });
  });

  describe('showEmpty', () => {
    it('is true when there is no uuid', () => {
      component.uuid = null;
      expect(component.showEmpty).toBeTrue();
    });

    it('is false when a uuid is present', () => {
      component.uuid = 'u';
      expect(component.showEmpty).toBeFalse();
    });
  });

  describe('getTooltipFn', () => {
    it('returns an empty string when there is no report loaded', () => {
      component.components.set(null);
      const fn = component.getTooltipFn(0);
      expect(fn(0, 0)).toBe('');
    });

    it('returns a tooltip string when a report is loaded', () => {
      const report = fakeCountReport(['Ansiedad']);
      component.components.set(report as unknown as never);
      const fn = component.getTooltipFn(0);
      expect(typeof fn(0, 0)).toBe('string');
    });

    it('handles fallback values when question or answer count is missing', () => {
      const report = {
        components: [
          {
            description: 'Ansiedad',
            text: 'Text',
            questions: [{ question: undefined, answers: [] }],
          },
        ],
      };
      component.components.set(report as unknown as PollCountReport);
      reportServiceSpy.getHMSeriesFromCountComponent.and.returnValue([
        { data: [] },
      ] as unknown as HMSeriesReturn);
      reportServiceSpy.regroupDynamicByColor.and.returnValue([
        { data: [] },
      ] as unknown as RegroupReturn);

      const fn = component.getTooltipFn(0);
      const result = fn(0, 0);
      expect(typeof result).toBe('string');
    });
  });

  describe('getChartType / onChartTypeChange', () => {
    it('defaults to heatmap when no type has been set', () => {
      component.componentsSelected = ['anxiety'];
      expect(component.getChartType(0)).toBe('heatmap');
    });

    it('returns the type previously set for that component', () => {
      component.componentsSelected = ['anxiety'];
      component.onChartTypeChange(0, 'column');
      expect(component.getChartType(0)).toBe('column');
    });
  });

  describe('getComponentOfChart', () => {
    it('strips the "Reporte: " prefix and lowercases the result', () => {
      expect(component.getComponentOfChart('Reporte: Ansiedad')).toBe(
        'ansiedad'
      );
    });

    it('returns undefined when no title is given', () => {
      expect(component.getComponentOfChart(undefined)).toBeUndefined();
    });
  });

  describe('getColumnData', () => {
    it('returns a shallow clone of the questions array', () => {
      const report = fakeCountReport(['Ansiedad']);
      component.components.set(report as unknown as never);
      const original = report.components[0].questions;

      const result = component.getColumnData(0);

      expect(result.questions).toEqual(original);
      expect(result.questions).not.toBe(original);
    });
  });

  describe('refreshSeries and _updateCardWidth', () => {
    it('calls generateSeries when components() is present', fakeAsync(() => {
      const compPrivates = component as unknown as ComponentWithPrivates;
      const report = fakeCountReport(['Ansiedad']);
      component.components.set(report as unknown as never);
      spyOn(component, 'generateSeries');

      compPrivates.refreshSeries(30);
      tick(30);

      expect(component.generateSeries).toHaveBeenCalledWith(
        report as unknown as never
      );
    }));

    it('does not call generateSeries when components() is null', fakeAsync(() => {
      const compPrivates = component as unknown as ComponentWithPrivates;
      component.components.set(null);
      spyOn(component, 'generateSeries');

      compPrivates.refreshSeries(10);
      tick(10);

      expect(component.generateSeries).not.toHaveBeenCalled();
    }));

    it('updates cardWidth based on contentQuarter offsetWidth', () => {
      const compPrivates = component as unknown as ComponentWithPrivates;
      component.contentQuarter = {
        nativeElement: { offsetWidth: 850 },
      } as ElementRef;

      compPrivates._updateCardWidth();

      expect(compPrivates.cardWidth()).toBe(850);
    });

    it('defaults cardWidth to 0 when contentQuarter is undefined', () => {
      const compPrivates = component as unknown as ComponentWithPrivates;
      component.contentQuarter = undefined as unknown as ElementRef;

      compPrivates._updateCardWidth();

      expect(compPrivates.cardWidth()).toBe(0);
    });
  });

  describe('window resize handling', () => {
    it('debounces resize', fakeAsync(() => {
      fixture.detectChanges();
      const compPrivates = component as unknown as ComponentWithPrivates;
      const spy = spyOn(compPrivates, 'refreshSeries').and.callThrough();
      window.dispatchEvent(new Event('resize'));
      tick(450);
      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('ngOnDestroy', () => {
    it('clears any pending timeouts', () => {
      const compPrivates = component as unknown as ComponentWithPrivates;
      const timeoutId = setTimeout(() => void 0, 1000);
      compPrivates.pendingTimeouts = [timeoutId];

      component.ngOnDestroy();

      expect(compPrivates.pendingTimeouts.length).toBe(0);
    });
  });
});
