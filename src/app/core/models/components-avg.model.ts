import { BaseModel } from './common/base.model';

export interface ComponentsAvgModel extends BaseModel {
  pollId: number;
  componentId: number;
  name: string;
  componentAvg: number;
}
