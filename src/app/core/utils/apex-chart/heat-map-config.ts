import { ApexOptions } from 'ng-apexcharts';
import { getRiskGroup } from '@core/constants/riskLevel';
import { customTooltip } from '@core/utils/apex-chart/customTooltip';
import { CHART_LAYOUT, fixedColorRange } from './chart.constants';

interface ChartContext {
  el: HTMLElement;
}

export function GetChartOptions(
  title: string,
  series: ApexAxisChartSeries,
  dataPointSelection?: (x: number, y: number) => void,
  baseChartOptions?: ApexOptions,
  tooltipCustomFunction?: (x: number, y: number) => string,
  availableWidth = 1500,
  fixColors = true
): ApexOptions {
  const CARD_EXPANDED_THRESHOLD_WIDTH = 1200;
  const CARD_HEADER_WIDTH = 96;
  const MIN_CHART_HEIGHT = 240;
  const isExpandedChart = availableWidth > CARD_EXPANDED_THRESHOLD_WIDTH;
  const chartValues = isExpandedChart
    ? CHART_LAYOUT.expanded
    : CHART_LAYOUT.compact;
  const FIXED_CELL_WIDTH = availableWidth / chartValues.columnDivisor;
  const CELL_HEIGHT = chartValues.cellHeight;
  const percentageToView = chartValues.labelPercent;
  const questionSection = percentageToView * availableWidth;
  const rowCount = series.length;
  const chartHeight = Math.max(
    MIN_CHART_HEIGHT,
    rowCount * CELL_HEIGHT + CARD_HEADER_WIDTH
  );
  const chartWidth = availableWidth;

  const options: ApexOptions = {
    series: series,
    chart: {
      zoom: {
        enabled: false,
      },
      type: 'heatmap',
      height: chartHeight,
      toolbar: {
        show: false,
      },
      offsetX: 0,
      offsetY: 0,
      animations: {
        enabled: false,
      },
      width: chartWidth,
      events: {
        mounted: chartContext => {
          fixCellWidths(chartContext, FIXED_CELL_WIDTH);
        },
        updated: chartContext => {
          fixCellWidths(chartContext, FIXED_CELL_WIDTH);
        },
        dataPointSelection: (
          event: Event,
          chartContext: unknown,
          config: { seriesIndex: number; dataPointIndex: number }
        ) => {
          if (dataPointSelection) {
            dataPointSelection(config.dataPointIndex, config.seriesIndex);
          }
        },
      },
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      position: 'top',
      horizontalAlign: 'center',
    },
    title: {
      text: title,
      style: {
        fontSize: '22px',
        fontWeight: '600',
      },
    },
    xaxis: {
      type: 'category',
      labels: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      crosshairs: { show: false },
    },
    yaxis: {
      labels: {
        maxWidth: questionSection,
        offsetX: 0,
      },
    },
    plotOptions: {
      heatmap: {
        distributed: false,
        useFillColorAsStroke: false,
        ...(fixColors && {
          colorScale: {
            inverse: false,
            ranges: fixedColorRange,
          },
        }),
      },
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: function (val: number, opts?): string {
          const rowIdx = opts.seriesIndex;
          const colIdx = opts.dataPointIndex;
          const grid = opts.series;

          if (grid[rowIdx][colIdx] === -1) {
            return '';
          }
          return getRiskGroup(val).toString();
        },
        title: {
          formatter: function (): string {
            return 'Average Risk Level:';
          },
        },
      },
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const content = () => {
          if (tooltipCustomFunction) {
            return tooltipCustomFunction(seriesIndex, dataPointIndex);
          } else {
            const dataPoint = w.config.series[seriesIndex].data[dataPointIndex];
            const color = w.globals.colors[seriesIndex];
            const yValue = dataPoint.y;
            const zValue = dataPoint.z;
            const formattedZValue = zValue;

            return customTooltip(yValue, formattedZValue, color);
          }
        };
        const wrap = (content: string) => {
          return `<div>${content}</div>`;
        };
        return wrap(content());
      },
    },
    ...baseChartOptions,
  };
  return options;
}

export function fixCellWidths(chartContext: ChartContext, cellWidth: number) {
  const el = chartContext.el as HTMLElement;
  const seriesGroups = el.querySelectorAll<SVGGElement>('.apexcharts-series');

  // to adjust each rect and its text in the middle
  seriesGroups.forEach(seriesGroup => {
    const rects = seriesGroup.querySelectorAll<SVGRectElement>(
      '.apexcharts-heatmap-rect'
    );
    const texts = seriesGroup.querySelectorAll<SVGTextElement>(
      '.apexcharts-data-labels text'
    );

    rects.forEach((rect, index) => {
      const DEFAULT_INDEX = 0;
      const CELL_MID_WIDTH = cellWidth / 2;
      const j = parseInt(rect.getAttribute('j') ?? String(DEFAULT_INDEX), 10);
      const newX = j * cellWidth;
      rect.setAttribute('width', String(cellWidth - 1));
      rect.setAttribute('x', String(newX));
      const text = texts[index];
      if (text) {
        text.setAttribute('x', String(newX + CELL_MID_WIDTH));
      }
    });
  });
}
