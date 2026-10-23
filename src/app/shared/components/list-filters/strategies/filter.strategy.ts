import { AppliedFilter } from '../models/list-filters.interface';

export interface FilterStrategy<T> {
  apply(data: T[], filters: AppliedFilter[]): T[];
}
