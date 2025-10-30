import {
  ApexChart,
  ApexFill,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
  ApexTitleSubtitle,
  ApexXAxis,
} from 'ng-apexcharts';

export class ColumnChartUtils {
  static createTitle(title: string): ApexTitleSubtitle {
    return {
      text: title,
      margin: 0,
      offsetY: 0,
    };
  }

  static createChartBase(onSelect?: (x: number, y: number) => void): ApexChart {
    return {
      type: 'bar',
      height: 650,
      stacked: true,
      stackType: '100%',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: false,
      },
      events: {
        dataPointSelection: (_event, _ctx, cfg) => {
          if (onSelect) onSelect(cfg.dataPointIndex, cfg.seriesIndex);
        },
      },
    };
  }

  static createPlotOptions(): ApexPlotOptions {
    return { bar: { horizontal: false } };
  }

  static createXAxis(categories: string[]): ApexXAxis {
    return {
      categories: categories,
      labels: {
        trim: true,
        hideOverlappingLabels: false,
        maxHeight: 100,
      },
    };
  }

  static createFill(): ApexFill {
    return { opacity: 0.8 };
  }

  static createLegend(): ApexLegend {
    return {
      position: 'top',
      horizontalAlign: 'left',
      height: 50,
      onItemClick: { toggleDataSeries: true },
    };
  }

  static createResponsive(): ApexResponsive[] {
    return [
      {
        breakpoint: 1000,
        options: {
          plotOptions: { bar: { horizontal: true } },
          categories: [],
          yaxis: {
            labels: {
              show: true,
              formatter: function (val: string) {
                const maxLength = 4;
                return val.length > maxLength
                  ? val.substring(0, maxLength) + '…'
                  : val;
              },
              style: {
                fontSize: 10,
              },
            },
          },
          xaxis: {
            labels: {
              show: true,
              style: {
                fontSize: 10,
              },
            },
          },
          legend: {
            horizontalAlign: 'center',
            fontSize: 10,
          },
        },
      },
    ];
  }
}
