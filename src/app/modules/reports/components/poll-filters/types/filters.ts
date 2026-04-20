export interface Filter {
  title: string;
  uuid: string;
  cohortIds: number[];
  variableIds: number[];
  lastVersion: boolean;
  evaluationId?: number | string;
  selectedComponentIndex?: number[];
  selectedComponents: string[];
}

export type FormKey =
  | 'selectedPoll'
  | 'lastVersion'
  | 'cohortIds'
  | 'componentNames'
  | 'variables';
