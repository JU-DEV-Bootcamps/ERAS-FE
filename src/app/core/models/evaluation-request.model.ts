import { EvaluationModel } from './evaluation.model';

export interface CreateEvaluationModel {
  name: string;
  startDate: Date;
  endDate: Date;
  pollName?: string;
  country?: string;
  configurationId: number;
}

export interface PagedReadEvaluationProcess {
  count: number;
  items: EvaluationModel[];
}
