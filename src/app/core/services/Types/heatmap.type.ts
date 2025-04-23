export interface HeatMapData {
  name: string;
  data: Serie[];
}

interface Serie {
  x: string;
  y: number;
}
