import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { JuService } from '../models/referrals.interfaces';
import { PagedResult } from '@core/services/interfaces/page.type';

import { BaseApiService } from '@core/services/api/base-api.service';
import { Pagination } from '@core/services/interfaces/server.type';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class JuServicesService extends BaseApiService {
  protected resource = 'ju_services';

  getAllJuServices(
    pagination?: Pagination
  ): Observable<PagedResult<JuService>> {
    let params = undefined;

    if (pagination) {
      params = new HttpParams()
        .set('PageSize', pagination.pageSize)
        .set('Page', pagination.page);
    }
    return this.get<PagedResult<JuService>>('', params);
  }

  addNewService(service: JuService): Observable<JuService> {
    return this.post<JuService>('', service);
  }
}
