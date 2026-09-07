import { GetChartOptions, fixedColorRange } from './heat-map-config';

describe('HeatMap Chart Configuration', () => {
  describe('GetChartOptions', () => {
    const mockSeries = [
      { name: 'Row 1', data: [{ x: 'Q1', y: 10, z: 'info@test.com' }] },
    ];

    it('should return valid ApexOptions with default parameters', () => {
      const options = GetChartOptions('HeatMap Title', mockSeries);

      expect(options.title?.text).toBe('HeatMap Title');
      expect(options.series).toEqual(mockSeries);
      expect(options.chart?.type).toBe('heatmap');
      expect(options.plotOptions?.heatmap?.colorScale).toBeDefined();
    });

    it('should calculate chart height based on series length (min 300)', () => {
      const shortOptions = GetChartOptions('Short', mockSeries);
      expect(shortOptions.chart?.height).toBe(300);

      const longSeries = Array.from({ length: 10 }).map((_, i) => ({
        name: `Row ${i}`,
        data: [],
      }));
      const longOptions = GetChartOptions('Long', longSeries);
      expect(longOptions.chart?.height).toBe(560);
    });

    it('should not include colorScale in plotOptions when fixColors is false', () => {
      const options = GetChartOptions(
        'Title',
        mockSeries,
        undefined,
        undefined,
        undefined,
        false
      );

      expect(options.plotOptions?.heatmap?.colorScale).toBeUndefined();
    });

    it('should trigger dataPointSelection callback if provided', () => {
      const selectionSpy = jasmine.createSpy('dataPointSelectionSpy');
      const options = GetChartOptions('Title', mockSeries, selectionSpy);

      const dataPointEvent = options.chart?.events?.dataPointSelection as (
        ...args: unknown[]
      ) => unknown;
      expect(dataPointEvent).toBeDefined();

      if (dataPointEvent) {
        dataPointEvent(
          new Event('click'),
          {},
          { seriesIndex: 2, dataPointIndex: 5 }
        );
        expect(selectionSpy).toHaveBeenCalledWith(5, 2);
      }
    });

    describe('Tooltip formatting', () => {
      it('should format tooltip Y value properly or return empty if -1', () => {
        const options = GetChartOptions('Title', mockSeries);

        const tooltipY = options.tooltip?.y as {
          formatter?: (...args: unknown[]) => unknown;
        };
        const yFormatter = tooltipY?.formatter;

        expect(yFormatter).toBeDefined();

        if (yFormatter) {
          const optsMinus1 = {
            seriesIndex: 0,
            dataPointIndex: 0,
            series: [[-1]],
          };
          expect(yFormatter(-1, optsMinus1)).toBe('');

          const optsNormal = {
            seriesIndex: 0,
            dataPointIndex: 0,
            series: [[10]],
          };
          expect(yFormatter(10, optsNormal)).toBeDefined();
        }
      });

      it('should format tooltip Y title to "Average Risk Level:"', () => {
        const options = GetChartOptions('Title', mockSeries);
        const tooltipY = options.tooltip?.y as {
          formatter?: (...args: unknown[]) => unknown;
          title?: { formatter?: (...args: unknown[]) => unknown };
        };
        const titleFormatter = tooltipY?.title?.formatter;

        expect(titleFormatter).toBeDefined();
        if (titleFormatter) {
          expect(titleFormatter('AnySeriesName')).toBe('Average Risk Level:');
        }
      });

      it('should execute tooltipCustomFunction if provided', () => {
        const customTooltipSpy = jasmine
          .createSpy('customTooltipSpy')
          .and.returnValue('<span>My Custom Tooltip</span>');
        const options = GetChartOptions(
          'Title',
          mockSeries,
          undefined,
          undefined,
          customTooltipSpy
        );

        const customFn = options.tooltip?.custom as (
          ...args: unknown[]
        ) => unknown;

        expect(customFn).toBeDefined();

        if (customFn) {
          const result = customFn({ seriesIndex: 1, dataPointIndex: 2, w: {} });

          expect(customTooltipSpy).toHaveBeenCalledWith(1, 2);
          expect(result).toBe('<div><span>My Custom Tooltip</span></div>');
        }
      });

      it('should fallback to default customTooltip if tooltipCustomFunction is not provided', () => {
        const options = GetChartOptions('Title', mockSeries);

        const customFn = options.tooltip?.custom as (
          ...args: unknown[]
        ) => unknown;

        if (customFn) {
          const mockW = {
            config: {
              series: [
                {
                  data: [
                    { x: 'Question 1', y: 'Answer 1', z: 'test@test.com' },
                  ],
                },
              ],
            },
          };

          const result = customFn({
            seriesIndex: 0,
            dataPointIndex: 0,
            w: mockW,
          });

          expect(result).toContain('<div>');
          expect(result).toContain('Question 1');
        }
      });
    });
  });

  describe('fixedColorRange', () => {
    it('should define exactly 6 risk color ranges', () => {
      expect(fixedColorRange.length).toBe(6);
    });

    it('should have the correct structure for each range item', () => {
      const firstItem = fixedColorRange[0];

      expect(firstItem.from).toBeDefined();
      expect(firstItem.to).toBeDefined();
      expect(firstItem.color).toBeDefined();
      expect(firstItem.foreColor).toBeDefined();
      expect(firstItem.name).toBeDefined();

      expect(firstItem.from).toBe(-1);
      expect(firstItem.to).toBe(0.49);
    });
  });
});
