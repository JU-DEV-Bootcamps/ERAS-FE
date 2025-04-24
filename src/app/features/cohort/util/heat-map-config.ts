import { ApexOptions } from 'ng-apexcharts';

export function GetChartOptions(
  title: string,
  series: ApexAxisChartSeries,
  dataPointSelection?: (x: number, y: number) => void
): ApexOptions {
  return {
    series: series,
    chart: {
      type: 'heatmap',
      toolbar: {
        show: false,
      },
      events: {
        dataPointSelection: (
          event: Event,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          chartContext: any,
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
        colorScale: {
          inverse: false,
          ranges: [
            {
              from: -1,
              to: 0,
              color: '#FFFFFF',
              foreColor: '#FFFFFF',
              name: 'No answer',
            },
            {
              from: 0,
              to: 1,
              color: '#008000',
              foreColor: '#FFFFFF',
              name: 'Low Risk',
            },
            {
              from: 1,
              to: 2,
              color: '#3CB371',
              foreColor: '#FFFFFF',
              name: 'Low-Medium Risk',
            },
            {
              from: 2,
              to: 3,
              color: '#F0D722',
              foreColor: '#FFFFFF',
              name: 'Medium Risk',
            },
            {
              from: 3,
              to: 4,
              color: '#FFA500',
              foreColor: '#FFFFFF',
              name: 'Medium-High Risk',
            },
            {
              from: 4,
              to: 10,
              color: '#FF0000',
              foreColor: '#FFFFFF',
              name: 'High Risk',
            },
          ],
        },
      },
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (val: number, opts?: any): string {
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
        const dataPoint = w.config.series[seriesIndex].data[dataPointIndex];
        const xValue = dataPoint.x;
        const yValue = dataPoint.y;
        const zValue = dataPoint.z;
        const formattedZValue = zValue
          .replace(/%/g, '%<br>')
          .replace(/\n\s+/g, '');

        return `<div class="apexcharts-tooltip-x" style="font-size: 13px; margin: 4px">${xValue}</div>
        <div style="border-top: 1px solid #ccc;"></div>
        <div class="apexcharts-tooltip-y" style="font-size: 13px; margin: 4px">Average Risk Level: <b>${yValue}</b></div>
        <div style="border-top: 1px solid #ccc;"></div>
        <div class="apexcharts-tooltip-y" style="font-size: 13px; margin: 4px"><b>${formattedZValue}</b></div>`;
      },
    },
  };
}
