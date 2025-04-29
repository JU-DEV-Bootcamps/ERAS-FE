export interface HeatmapSummaryModel {
  components: HeatmapComponentModel[];
  series: HeatmapSeriesModel[];
}
interface HeatmapComponentModel {
  description: string;
  variables: HeatmapVariableModel[];
}
interface HeatmapVariableModel {
  description: string;
  averageScore: number;
}
interface HeatmapSeriesModel {
  name: string;
  data: HeatmapDataModel[];
}
interface HeatmapDataModel {
  x: string;
  y: number;
  z: string;
}
