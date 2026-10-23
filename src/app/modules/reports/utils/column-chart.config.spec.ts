import { ColumnChartUtils } from './column-chart.config';
import { ComponentRisk } from '@core/models/summary.model';

type DataPointSelectionHandler = (
  event: unknown,
  ctx: unknown,
  config: {
    dataPointIndex: number;
    seriesIndex: number;
    w: {
      config: {
        series: ComponentRisk[];
      };
    };
  }
) => void;

describe('ColumnChartUtils', () => {
  describe('createTitle', () => {
    it('should create title configuration with specified text', () => {
      const title = 'Reporte de Riesgo';
      const result = ColumnChartUtils.createTitle(title);

      expect(result).toEqual({
        text: title,
        margin: 0,
        offsetY: 10,
      });
    });
  });

  describe('createChartBase', () => {
    it('should use default MIN_HEIGHT (580) when componentCount * 20 is smaller than 580', () => {
      const result = ColumnChartUtils.createChartBase(undefined, 5); // 5 * 20 = 100 < 580

      expect(result.height).toBe(580);
      expect(result.type).toBe('bar');
      expect(result.stacked).toBeTrue();
      expect(result.stackType).toBe('100%');
      expect(result.toolbar).toEqual({ show: false });
      expect(result.zoom).toEqual({ enabled: false });
      expect(result.animations).toEqual({ enabled: false });
    });

    it('should calculate height dynamically when componentCount * 20 exceeds MIN_HEIGHT', () => {
      const componentCount = 40; // 40 * 20 = 800 > 580
      const result = ColumnChartUtils.createChartBase(
        undefined,
        componentCount
      );

      expect(result.height).toBe(800);
    });

    it('should call onSelect callback on dataPointSelection event', () => {
      const onSelectSpy = jasmine.createSpy('onSelect');
      const chartBase = ColumnChartUtils.createChartBase(onSelectSpy);

      const mockSeries = [
        { name: 'Alto', data: [] },
      ] as unknown as ComponentRisk[];
      const mockConfig = {
        dataPointIndex: 2,
        seriesIndex: 1,
        w: {
          config: {
            series: mockSeries,
          },
        },
      };

      const dataPointSelectionFn = chartBase.events?.dataPointSelection;
      expect(dataPointSelectionFn).toBeDefined();

      const handler =
        dataPointSelectionFn as unknown as DataPointSelectionHandler;
      handler(undefined, undefined, mockConfig);

      expect(onSelectSpy).toHaveBeenCalledWith(2, 1, mockSeries);
    });

    it('should not throw error on dataPointSelection if onSelect is not provided', () => {
      const chartBase = ColumnChartUtils.createChartBase();

      const mockConfig = {
        dataPointIndex: 0,
        seriesIndex: 0,
        w: {
          config: {
            series: [] as ComponentRisk[],
          },
        },
      };

      const dataPointSelectionFn = chartBase.events?.dataPointSelection;
      expect(dataPointSelectionFn).toBeDefined();

      const handler =
        dataPointSelectionFn as unknown as DataPointSelectionHandler;
      expect(() => {
        handler(undefined, undefined, mockConfig);
      }).not.toThrow();
    });
  });

  describe('createPlotOptions', () => {
    it('should return plotOptions with vertical bars', () => {
      const result = ColumnChartUtils.createPlotOptions();

      expect(result).toEqual({
        bar: {
          horizontal: false,
        },
      });
    });
  });

  describe('createXAxis', () => {
    it('should configure X-Axis with provided categories and label settings', () => {
      const categories = ['Ansiedad', 'Depresion', 'Estres'];
      const result = ColumnChartUtils.createXAxis(categories);

      expect(result.categories).toEqual(categories);
      expect(result.labels).toEqual({
        trim: true,
        hideOverlappingLabels: false,
        maxHeight: 100,
      });
    });
  });

  describe('createFill', () => {
    it('should return fill configuration with opacity 1', () => {
      const result = ColumnChartUtils.createFill();

      expect(result).toEqual({ opacity: 1 });
    });
  });

  describe('createLegend', () => {
    it('should return legend configuration with top position and toggle enabled', () => {
      const result = ColumnChartUtils.createLegend();

      expect(result).toEqual({
        position: 'top',
        horizontalAlign: 'left',
        height: 50,
        onItemClick: { toggleDataSeries: true },
      });
    });
  });

  describe('createResponsive', () => {
    it('should return responsive options for breakpoint 1000', () => {
      const result = ColumnChartUtils.createResponsive();

      expect(result.length).toBe(1);
      expect(result[0].breakpoint).toBe(1000);
      expect(result[0].options.plotOptions).toEqual({
        bar: { horizontal: true },
      });
    });

    it('should truncate yaxis labels longer than 4 characters in responsive formatter', () => {
      const result = ColumnChartUtils.createResponsive();
      const formatter = result[0].options.yaxis.labels.formatter;

      expect(formatter('Ansiedad')).toBe('Ansi…');
      expect(formatter('Depresion')).toBe('Depr…');
    });

    it('should return original text if yaxis label has 4 or fewer characters in responsive formatter', () => {
      const result = ColumnChartUtils.createResponsive();
      const formatter = result[0].options.yaxis.labels.formatter;

      expect(formatter('Test')).toBe('Test');
      expect(formatter('Sol')).toBe('Sol');
      expect(formatter('')).toBe('');
    });
  });
});
