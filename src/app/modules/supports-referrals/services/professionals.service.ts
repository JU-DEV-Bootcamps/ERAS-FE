import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AssignedProfessional } from '../models/referrals.interfaces';
import { PagedResult } from '@core/services/interfaces/page.type';

import { BaseApiService } from '@core/services/api/base-api.service';
import { Pagination } from '@core/services/interfaces/server.type';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfessionalsService extends BaseApiService {
  protected resource = 'professionals';

  getAllProfessionals(
    pagination?: Pagination
  ): Observable<PagedResult<AssignedProfessional>> {
    let params = undefined;

    if (pagination) {
      params = new HttpParams()
        .set('PageSize', pagination.pageSize)
        .set('Page', pagination.page);
    }
    return this.get<PagedResult<AssignedProfessional>>('', params);
  }

  addNewProfessional(
    professional: AssignedProfessional
  ): Observable<AssignedProfessional> {
    return this.post<AssignedProfessional>('', professional);
  }
}
