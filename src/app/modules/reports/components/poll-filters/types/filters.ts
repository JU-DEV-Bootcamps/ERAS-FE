export interface Filter {
  title: string;
  uuid: string;
  cohortIds: number[];
  variableIds: number[];
}

export type FormKey =
  | 'selectedPoll'
  | 'lastVersion'
  | 'cohortIds'
  | 'componentNames'
  | 'variables';
