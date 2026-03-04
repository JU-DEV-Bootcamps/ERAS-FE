export interface Filter {
  title: string;
  uuid: string;
  cohortIds: number[];
  variableIds: number[];
  lastVersion: boolean;
}

export type FormKey =
  | 'selectedPoll'
  | 'lastVersion'
  | 'cohortIds'
  | 'componentNames'
  | 'variables';
