export interface Filter {
  title: string;
  uuid: string;
  cohortIds: number[];
  variableIds: number[];
  lastVersion: boolean;
  evaluationId?: number | string;
}

export type FormKey =
  | 'selectedPoll'
  | 'lastVersion'
  | 'cohortIds'
  | 'componentNames'
  | 'variables';
