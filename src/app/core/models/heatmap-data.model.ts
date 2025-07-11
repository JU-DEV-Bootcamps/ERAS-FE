export interface SummaryHeatMapData {
  name: string;
  data: SummarySerie[];
}

export interface SummarySerie {
  x: string;
  y: number;
  z: string;
}

export interface DynamicHeatMapData {
  name: string;
  data: DynamicSerie[];
}

export interface DynamicSerie {
  x: number;
  y: number;
  totalFillers?: number;
}
