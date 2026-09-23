import { ChartBase, ApexChartAnnotation } from './abstract-chart';
import { RISK_COLORS } from '@core/constants/riskLevel';

class TestChart extends ChartBase {
  public callLoadDataFromInput(
    categoriesX: string[],
    seriesY: number[],
    colors: string[]
  ): ApexChartAnnotation[] {
    return this.loadDataFromInput(categoriesX, seriesY, colors);
  }
}

describe('ChartBase', () => {
  let chart: TestChart;

  beforeEach(() => {
    chart = new TestChart();
  });

  it('should create', () => {
    expect(chart).toBeTruthy();
  });

  describe('loadDataFromInput', () => {
    it('should map categories and series into x/y annotations', () => {
      const result = chart.callLoadDataFromInput(
        ['A', 'B'],
        [1, 2],
        ['#111', '#222']
      );

      expect(result).toEqual([
        { x: 'A', y: 1, fillColor: '#111' },
        { x: 'B', y: 2, fillColor: '#222' },
      ]);
    });

    it('should use the provided color when colors array has a value at the index', () => {
      const result = chart.callLoadDataFromInput(['A'], [1], ['#custom']);

      expect(result[0].fillColor).toBe('#custom');
    });

    it('should fall back to RISK_COLORS[y] when colors is an empty array', () => {
      const result = chart.callLoadDataFromInput(['A'], [1], []);

      expect(result[0].fillColor).toBe(RISK_COLORS[1] ?? RISK_COLORS.default);
    });

    it('should fall back to RISK_COLORS[y] when colors is undefined', () => {
      const result = chart.callLoadDataFromInput(
        ['A'],
        [1],
        undefined as unknown as string[]
      );

      expect(result[0].fillColor).toBe(RISK_COLORS[1] ?? RISK_COLORS.default);
    });

    it('should fall back to RISK_COLORS[y] when colors[index] is falsy (empty string)', () => {
      const result = chart.callLoadDataFromInput(['A'], [1], ['']);

      expect(result[0].fillColor).toBe(RISK_COLORS[1] ?? RISK_COLORS.default);
    });

    it('should fall back to RISK_COLORS.default when y has no matching risk color and no colors are given', () => {
      const result = chart.callLoadDataFromInput(['A'], [999], []);

      expect(result[0].fillColor).toBe(RISK_COLORS.default);
    });

    it('should return an empty array when seriesY is empty', () => {
      const result = chart.callLoadDataFromInput([], [], []);
      expect(result).toEqual([]);
    });
  });
});
