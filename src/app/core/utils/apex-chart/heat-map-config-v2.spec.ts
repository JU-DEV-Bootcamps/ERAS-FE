import { GetChartOptions, fixCellWidths } from './heat-map-config-v2';

describe('Chart Setup Utilities', () => {
  describe('GetChartOptions', () => {
    const mockSeries = [
      { name: 'Row 1', data: [{ x: 'Q1', y: 10, z: 'info@test.com' }] },
    ];

    it('should return valid ApexOptions with default parameters', () => {
      const options = GetChartOptions('My Chart Title', mockSeries);

      expect(options.title?.text).toBe('My Chart Title');
      expect(options.series).toEqual(mockSeries);
      expect(options.chart?.type).toBe('heatmap');
      expect(options.plotOptions?.heatmap?.colorScale).toBeDefined();
    });

    it('should not include colorScale in plotOptions when fixColors is false', () => {
      const options = GetChartOptions(
        'My Chart Title',
        mockSeries,
        undefined,
        undefined,
        undefined,
        1500,
        false,
        false
      );

      expect(options.plotOptions?.heatmap?.colorScale).toBeUndefined();
    });

    it('should trigger dataPointSelection callback if provided', () => {
      const selectionSpy = jasmine.createSpy('dataPointSelectionSpy');
      const options = GetChartOptions('Title', mockSeries, selectionSpy);

      const dataPointEvent = options.chart?.events?.dataPointSelection;
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
            series: [[50]],
          };
          expect(yFormatter(50, optsNormal)).toBeDefined();
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
          expect(titleFormatter('SeriesName')).toBe('Average Risk Level:');
        }
      });

      it('should execute tooltipCustomFunction if provided', () => {
        const customTooltipSpy = jasmine
          .createSpy('customTooltipSpy')
          .and.returnValue('<span>My Tooltip</span>');
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
          expect(result).toBe('<div><span>My Tooltip</span></div>');
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
                { data: [{ x: 'Student 1', y: '5', z: 'mail@test.com' }] },
              ],
            },
            globals: {
              colors: ['#FF0000'],
            },
          };

          const result = customFn({
            seriesIndex: 0,
            dataPointIndex: 0,
            w: mockW,
          });

          expect(result).toContain('<div>');
          expect(result).toContain('Student 1');
        }
      });
    });
  });

  describe('fixCellWidths', () => {
    it('should adjust rect widths/x and text x positions correctly', () => {
      const fakeChartElement = document.createElement('div');
      fakeChartElement.innerHTML = `
        <svg class="apexcharts-series">
          <g>
            <rect class="apexcharts-heatmap-rect" j="0"></rect>
            <rect class="apexcharts-heatmap-rect" j="1"></rect>
          </g>
          <g class="apexcharts-data-labels">
            <text>10%</text>
            <text>20%</text>
          </g>
        </svg>
      `;

      const mockChartContext = { el: fakeChartElement };
      const cellWidth = 100;

      fixCellWidths(
        mockChartContext as unknown as { el: HTMLElement },
        cellWidth
      );

      const rects = fakeChartElement.querySelectorAll(
        '.apexcharts-heatmap-rect'
      );
      const texts = fakeChartElement.querySelectorAll('text');

      expect(rects[0].getAttribute('width')).toBe('99');
      expect(rects[0].getAttribute('x')).toBe('0');
      expect(texts[0].getAttribute('x')).toBe('50');

      expect(rects[1].getAttribute('width')).toBe('99');
      expect(rects[1].getAttribute('x')).toBe('100');
      expect(texts[1].getAttribute('x')).toBe('150');
    });

    it('should fallback to DEFAULT_INDEX (0) if rect does not have a "j" attribute', () => {
      const fakeChartElement = document.createElement('div');
      fakeChartElement.innerHTML = `
        <svg class="apexcharts-series">
          <rect class="apexcharts-heatmap-rect"></rect> <!-- Sin atributo 'j' -->
        </svg>
      `;

      fixCellWidths(
        { el: fakeChartElement } as unknown as { el: HTMLElement },
        50
      );

      const rect = fakeChartElement.querySelector('.apexcharts-heatmap-rect');
      expect(rect?.getAttribute('x')).toBe('0');
    });
  });
});
