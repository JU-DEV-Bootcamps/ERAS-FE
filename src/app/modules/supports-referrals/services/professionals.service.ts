import { Injectable } from '@angular/core';

import { Observable, shareReplay, tap } from 'rxjs';

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

  private cache$: Observable<PagedResult<AssignedProfessional>> | null = null;

  getAllProfessionals(
    pagination?: Pagination
  ): Observable<PagedResult<AssignedProfessional>> {
    let params = undefined;

    if (this.cache$) {
      return this.cache$;
    }

    if (pagination) {
      params = new HttpParams()
        .set('PageSize', pagination.pageSize)
        .set('Page', pagination.page);
    }
    this.cache$ = this.get<PagedResult<AssignedProfessional>>('', params).pipe(
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.cache$;
  }

  addNewProfessional(
    professional: AssignedProfessional
  ): Observable<AssignedProfessional> {
    return this.post<AssignedProfessional>('', professional).pipe(
      tap(() => this.invalidateCache())
    );
  }

  invalidateCache(): void {
    this.cache$ = null;
  }
}
