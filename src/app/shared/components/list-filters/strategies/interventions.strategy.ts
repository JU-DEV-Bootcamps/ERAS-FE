import { Injectable } from '@angular/core';
import { FilterStrategy } from './filter.strategy';
import { InterventionModel } from '@core/models/assessment.model';
import { AppliedFilter, FilterName } from '../models/list-filters.interface';

@Injectable({ providedIn: 'root' })
export class InterventionFilterStrategy implements FilterStrategy<InterventionModel> {
  apply(
    data: InterventionModel[],
    filters: AppliedFilter[]
  ): InterventionModel[] {
    return data.filter(intervention => {
      const statusFilter = filters.find(
        filter => filter.name === FilterName.Status
      );
      const statusMatch =
        statusFilter &&
        intervention.status &&
        (statusFilter.value as string[]).includes(intervention.status);

      const typeFilter = filters.find(
        filter => filter.name === FilterName.Type
      );
      const typeMatch =
        typeFilter &&
        (typeFilter.value as string[]).includes(intervention.kind);

      return statusMatch && typeMatch;
    });
  }
}
