import { EvaluationModel } from './evaluation.model';

export interface CreateEvaluationModel {
  name: string;
  startDate: Date;
  endDate: Date;
  pollName?: string;
  country?: string;
}

export interface PagedReadEvaluationProcess {
  count: number;
  items: EvaluationModel[];
}
