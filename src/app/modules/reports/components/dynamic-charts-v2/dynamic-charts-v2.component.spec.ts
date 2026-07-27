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

type ObsType<T> = T extends Observable<infer U> ? U : unknown;

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
            data: [],
          },
        ] as unknown as ReturnType<
          ReportService['getHMSeriesFromCountComponent']
        >;
      }
    );

    reportServiceSpy.regroupDynamicByColor.and.callFake(
      (series: unknown) =>
        series as unknown as ReturnType<ReportService['regroupDynamicByColor']>
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
    it('sets hasNoResults when API returns null', () => {
      component.uuid = 'u';
      reportServiceSpy.getCountPoolReport.and.returnValue(
        of(null as unknown as never)
      );
      component.generateHeatMap([1], [2]);
      expect(component.hasNoResults).toBeTrue();
    });

    it('populates data on success', fakeAsync(() => {
      component.uuid = 'u';
      const report = fakeCountReport(['Ansiedad']);
      reportServiceSpy.getCountPoolReport.and.returnValue(
        of({ body: report, status: '200' } as unknown as ObsType<
          ReturnType<ReportService['getCountPoolReport']>
        >)
      );
      fixture.detectChanges();
      component.generateHeatMap([1], [2]);
      tick(20);
      expect(component.chartsOptions.length).toBe(1);
    }));
  });

  describe('handleFilterSelect', () => {
    it('calls generateHeatMap for valid filter', () => {
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
      expect(component.generateHeatMap).toHaveBeenCalled();
    });
  });

  describe('onToggle', () => {
    it('expands and collapses a card', () => {
      component.contentQuarter = {
        nativeElement: { offsetHeight: 100 },
      } as ElementRef;

      component.uuid = 'u';
      component.onToggle('c-1');
      expect(component.expandedId).toBe('c-1');
      expect(component.isAnyCardExpanded).toBeTrue();

      component.onToggle('c-1');
      expect(component.expandedId).toBeNull();
      expect(component.gridHeight).toBe(100);
    });
  });

  describe('openDetailsModal / closePanel', () => {
    it('opens and closes panel', () => {
      const q = { question: 'Q', answers: [], averageRisk: 0, position: 0 };
      component.openDetailsModal(
        'u',
        '1',
        q as unknown as never,
        'A' as unknown as never
      );
      expect(component.isPanelOpen()).toBeTrue();
      component.closePanel();
      expect(component.isPanelOpen()).toBeFalse();
    });
  });

  describe('window resize handling', () => {
    it('debounces resize', fakeAsync(() => {
      fixture.detectChanges();
      const compWithPrivate = component as unknown as {
        refreshSeries: () => void;
      };
      const spy = spyOn(compWithPrivate, 'refreshSeries').and.callThrough();
      window.dispatchEvent(new Event('resize'));
      tick(450);
      expect(spy).toHaveBeenCalled();
    }));
  });
});
