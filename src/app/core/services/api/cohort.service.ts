import { Injectable } from '@angular/core';
import { CohortModel } from '../../models/cohort.model';
import { CohortsSummaryModel } from '../../models/summary.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class CohortService extends BaseApiService {
  protected resource = 'Students/Cohorts';

  getCohorts() {
    return this.get<CohortModel[]>('');
  }

  getCohortsSummary() {
    return this.get<CohortsSummaryModel>('summary');
  }

  getCohortsDetails() {
    return this.get<CohortsSummaryModel>('details');
  }
}
