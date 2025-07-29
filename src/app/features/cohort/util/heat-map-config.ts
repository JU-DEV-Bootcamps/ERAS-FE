import { ApexOptions } from 'ng-apexcharts';
import {
  RISK_COLORS,
  RISK_LABELS,
  RISK_TEXT_COLORS,
} from '../../../core/constants/riskLevel';

export function GetChartOptions(
  title: string,
  series: ApexAxisChartSeries,
  dataPointSelection?: (x: number, y: number) => void,
  baseChartOptions?: ApexOptions,
  tooltipCustomFunction?: (x: number, y: number) => string,
  fixColors = true
): ApexOptions {
  const options: ApexOptions = {
    series: series,
    chart: {
      zoom: {
        enabled: false,
      },
      type: 'heatmap',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: false,
      },
      events: {
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
    plotOptions: {
      heatmap: {
        distributed: false,
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
        show: true,
      },
      y: {
        formatter: function (val: number, opts?): string {
          const rowIdx = opts.seriesIndex;
          const colIdx = opts.dataPointIndex;
          const grid = opts.series;

          if (grid[rowIdx][colIdx] === -1) {
            return '';
          }
          return val.toString();
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
            const xValue = dataPoint.x;
            const yValue = dataPoint.y;
            const zValue = dataPoint.z;
            const formattedZValue = zValue;

            return `<div class="apexcharts-tooltip-x" style="font-size: 13px; margin: 4px"><b>Question: </b>${xValue}</div>
        <div style="border-top: 1px solid #ccc;"></div>
        <div class="apexcharts-tooltip-y" style="font-size: 13px; margin: 4px"><b>Answer: </b>${yValue}</div>
        <div style="border-top: 1px solid #ccc;"><b>Details:</b></div>
        <div class="apexcharts-tooltip-y" style="font-size: 13px; margin: 4px">${formattedZValue}</div>`;
          }
        };
        const wrap = (content: string) => {
          return `
            <div class="apex-tooltip-container">
              ${content}
            </div>
            `;
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
    to: 0,
    color: RISK_COLORS[0], //'#FFFFFF',
    foreColor: RISK_TEXT_COLORS[0],
    name: RISK_LABELS[0], //No Answer
  },
  {
    from: 0,
    to: 1,
    color: RISK_COLORS[1], //'#008000',
    foreColor: RISK_TEXT_COLORS[1],
    name: RISK_LABELS[1], //'Low Risk',
  },
  {
    from: 1,
    to: 2,
    color: RISK_COLORS[2], //'#3CB371',
    foreColor: RISK_TEXT_COLORS[2],
    name: RISK_LABELS[2], //'Low-Medium Risk',
  },
  {
    from: 2,
    to: 3,
    color: RISK_COLORS[3], //'#F0D722',
    foreColor: RISK_TEXT_COLORS[3],
    name: RISK_LABELS[3], //'Medium Risk',
  },
  {
    from: 3,
    to: 4,
    color: RISK_COLORS[4], //'#FFA500',
    foreColor: RISK_TEXT_COLORS[4],
    name: RISK_LABELS[4], //'Medium-High Risk',
  },
  {
    from: 4,
    to: 14,
    color: RISK_COLORS[5], //'#FF0000',
    foreColor: RISK_TEXT_COLORS[5],
    name: RISK_LABELS[5], //'High Risk',
  },
];
