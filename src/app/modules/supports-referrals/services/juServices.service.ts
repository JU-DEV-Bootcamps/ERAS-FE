import { Injectable } from '@angular/core';

import { Observable, shareReplay, tap } from 'rxjs';

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
  private cache$: Observable<PagedResult<JuService>> | null = null;

  getAllJuServices(
    pagination?: Pagination
  ): Observable<PagedResult<JuService>> {
    let params = undefined;

    if (this.cache$) {
      return this.cache$;
    }

    if (pagination) {
      params = new HttpParams()
        .set('PageSize', pagination.pageSize)
        .set('Page', pagination.page);
    }
    this.cache$ = this.get<PagedResult<JuService>>('', params).pipe(
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.cache$;
  }

  addNewService(service: JuService): Observable<JuService> {
    return this.post<JuService>('', service).pipe(
      tap(() => this.invalidateCache())
    );
  }

  invalidateCache(): void {
    this.cache$ = null;
  }
}
