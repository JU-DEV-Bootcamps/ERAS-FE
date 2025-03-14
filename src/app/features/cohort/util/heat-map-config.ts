import { ApexOptions } from 'ng-apexcharts';

export const ChartOptions: ApexOptions = {
  series: [],
  chart: {
    type: 'heatmap',
    toolbar: {
      show: false,
    },
  },
  title: {
    text: 'Heat Map - All Components',
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
    custom: function ({ series, seriesIndex, dataPointIndex, w }) {
      const yValue = series[seriesIndex][dataPointIndex];
      const xValue = w.globals.labels[dataPointIndex];

      return `<div class="apexcharts-tooltip-x" style="font-size: 13px; margin: 4px">${xValue}</div>
      <div style="border-top: 1px solid #ccc;"></div>
      <div class="apexcharts-tooltip-y" style="font-size: 13px; margin: 4px">Average Risk Level: <b>${yValue}</b></div>`;
    },
  },
};
