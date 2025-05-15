import { ApexOptions } from 'ng-apexcharts';
import {
  RISK_COLORS,
  RISK_TEXT_COLORS,
} from '../../../core/constants/riskLevel';

export const ChartOptionsColorsCount: ApexOptions = {
  series: [],
  chart: {
    type: 'heatmap',
    toolbar: {
      show: true,
      tools: {
        download:
          '<span class="material-icons" style="font-size: 40px; color: var(--primary-color);">download_for_offline</span>',
      },
    },
  },
  title: {
    text: '',
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
      colorScale: {
        inverse: false,
        ranges: [
          {
            from: -1,
            to: 0,
            color: RISK_COLORS[0],
            foreColor: RISK_TEXT_COLORS[0],
            name: 'No answer',
          },
          {
            from: 0,
            to: 2,
            color: RISK_COLORS[1],
            foreColor: RISK_TEXT_COLORS[1],
            name: 'Low Risk',
          },
          {
            from: 2,
            to: 4,
            color: RISK_COLORS[2],
            foreColor: RISK_TEXT_COLORS[2],
            name: 'Low-Medium Risk',
          },
          {
            from: 4,
            to: 6,
            color: RISK_COLORS[3],
            foreColor: RISK_TEXT_COLORS[3],
            name: 'Medium Risk',
          },
          {
            from: 6,
            to: 8,
            color: RISK_COLORS[4],
            foreColor: RISK_TEXT_COLORS[4],
            name: 'Medium-High Risk',
          },
          {
            from: 8,
            to: 100,
            color: RISK_COLORS['default'],
            foreColor: RISK_TEXT_COLORS['default'],
            name: 'High Risk',
          },
        ],
      },
    },
  },
  tooltip: {
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
        formatter: function (seriesName: string, opts?): string {
          const rowIdx = opts.seriesIndex;
          const colIdx = opts.dataPointIndex;
          const grid = opts.series;

          if (grid[rowIdx][colIdx] === -1) {
            return '';
          }
          return seriesName;
        },
      },
    },
    x: {
      show: true,
      formatter: function (val: number): string {
        return `Answer: ${val}`;
      },
    },
    custom: function ({ seriesIndex, dataPointIndex, w }) {
      const dataPoint = w.config.series[seriesIndex].data[dataPointIndex];
      const seriesName = w.config.series[seriesIndex].name;

      const xValue = dataPoint.x;
      const yValue = dataPoint.y;
      const zValue = dataPoint.count;

      const valueName = `<div class="apexcharts-tooltip-y" style="font-size: 13px; margin: 4px"><b>(Avg: ${yValue})</b> ${seriesName}</div>`;
      const answer = `<div class="apexcharts-tooltip-x" style="font-size: 13px; margin: 4px"><b>Answer:</b> ${xValue}</div>`;
      const responses = `<div class="apexcharts-tooltip-x" style="font-size: 13px; margin: 4px"><b>Responses:</b> ${zValue}</div>`;

      const divider = `<div style="border-top: 1px solid #ccc;"></div>`;

      return `${valueName}${divider}${answer}${responses}`;
    },
  },
};
