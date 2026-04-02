import { ApexOptions } from 'ng-apexcharts';
import {
  RISK_COLORS,
  RISK_LABELS,
  RISK_TEXT_COLORS,
  getRiskGroup,
} from '@core/constants/riskLevel';
import { customTooltip } from '@core/utils/apex-chart/customTooltip';

interface ChartContext {
  el: HTMLElement;
}

export function GetChartOptions(
  title: string,
  series: ApexAxisChartSeries,
  dataPointSelection?: (x: number, y: number) => void,
  baseChartOptions?: ApexOptions,
  tooltipCustomFunction?: (x: number, y: number) => string,
  fixColors = true,
  columnCount = 6,
  availableWidth = 6
): ApexOptions {
  console.log('here available', availableWidth);
  console.log('here data', series);
  console.log('here points', dataPointSelection);

  const isExpandedChart = availableWidth > 1200;
  const FIXED_CELL_WIDTH = isExpandedChart
    ? availableWidth / 12
    : availableWidth / 10;
  const CELL_HEIGHT = isExpandedChart ? 80 : 40;
  const percentageToView = isExpandedChart ? 45 : 30;
  const rowCount = series.length;
  const chartHeight = Math.max(240, rowCount * CELL_HEIGHT + 96);
  const questionSection = (percentageToView * availableWidth) / 100;
  const chartWidth = 0.98 * availableWidth;

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
          fixCellWidths(chartContext, columnCount, FIXED_CELL_WIDTH);
        },
        updated: chartContext => {
          fixCellWidths(chartContext, columnCount, FIXED_CELL_WIDTH);
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
    },
    xaxis: {
      type: 'category',
      labels: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        maxWidth: questionSection,
        offsetX: 0,
      },
    },
    grid: {
      padding: {
        left: 0,
        right: 0,
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

export const fixedColorRange = [
  {
    from: -1,
    to: 0.49,
    color: RISK_COLORS[0], //'#FFFFFF',
    foreColor: RISK_TEXT_COLORS[0],
    name: RISK_LABELS[0], //No Answer
  },
  {
    from: 0.5,
    to: 1.49,
    color: RISK_COLORS[1], //'#008000',
    foreColor: RISK_TEXT_COLORS[1],
    name: RISK_LABELS[1], //'Low Risk',
  },
  {
    from: 1.5,
    to: 2.49,
    color: RISK_COLORS[2], //'#3CB371',
    foreColor: RISK_TEXT_COLORS[2],
    name: RISK_LABELS[2], //'Low-Medium Risk',
  },
  {
    from: 2.5,
    to: 3.49,
    color: RISK_COLORS[3], //'#F0D722',
    foreColor: RISK_TEXT_COLORS[3],
    name: RISK_LABELS[3], //'Medium Risk',
  },
  {
    from: 3.5,
    to: 4.49,
    color: RISK_COLORS[4], //'#FFA500',
    foreColor: RISK_TEXT_COLORS[4],
    name: RISK_LABELS[4], //'Medium-High Risk',
  },
  {
    from: 4.5,
    to: 14,
    color: RISK_COLORS[5], //'#FF0000',
    foreColor: RISK_TEXT_COLORS[5],
    name: RISK_LABELS[5], //'High Risk',
  },
];

export function fixCellWidths(
  chartContext: ChartContext,
  columnCount: number,
  cellWidth: number
) {
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
      const j = parseInt(rect.getAttribute('j') ?? '0', 10);
      const newX = j * cellWidth;
      rect.setAttribute('width', String(cellWidth - 1));
      rect.setAttribute('x', String(newX));
      const text = texts[index];
      if (text) {
        text.setAttribute('x', String(newX + cellWidth / 2));
      }
    });
  });
}
