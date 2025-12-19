import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AssignedProfessional } from '../models/referrals.interfaces';
import { PagedResult } from '@core/services/interfaces/page.type';

import { BaseApiService } from '@core/services/api/base-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProfessionalsService extends BaseApiService {
  protected resource = 'professionals';

  getAllProfessionals(): Observable<PagedResult<AssignedProfessional>> {
    return this.get<PagedResult<AssignedProfessional>>('');
  }
}
