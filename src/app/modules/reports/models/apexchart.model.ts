import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
} from 'ng-apexcharts';

export interface ChartOptions {
  chart: ApexChart;
  colors: string[];
  fill: ApexFill;
  foreColor: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  series: ApexAxisChartSeries;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  xaxis: ApexXAxis;
}
