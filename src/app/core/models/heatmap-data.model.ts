export interface HeatMapData {
  name: string;
  data: Serie[];
}

export interface Serie {
  x: string;
  y: number;
  z: string;
}
