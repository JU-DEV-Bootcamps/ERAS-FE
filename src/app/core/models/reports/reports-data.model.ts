import { ComponentValueType } from '../../../features/heat-map/types/risk-students-detail.type';
import { DynamicSerie, SummarySerie } from '../heatmap-data.model';

export interface DynamicReport {
  name: string;
  data: DynamicSerie[];
}

export interface SummaryReport {
  text: string;
  description: ComponentValueType;
  name: ComponentValueType;
  data: SummarySerie[];
}
