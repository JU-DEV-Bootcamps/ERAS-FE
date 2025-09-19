import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { forkJoin, Observable, switchMap } from 'rxjs';
import Keycloak from 'keycloak-js';

import {
  Referral,
  ReferralResponse,
  RESTReferral,
} from '../models/referrals.interfaces';
import { PagedResult } from '@core/services/interfaces/page.type';
import { Pagination } from '@core/services/interfaces/server.type';

import { BaseApiService } from '@core/services/api/base-api.service';
import { ReferralsMapperService } from './referrals.mapper.service';

@Injectable({
  providedIn: 'root',
})
export class ReferralsService extends BaseApiService {
  protected resource = 'remissions';

  keycloak = inject(Keycloak);
  referralsMapperService = inject(ReferralsMapperService);

  getReferralsPagination({ page = 0, pageSize = 10 }: Pagination) {
    return forkJoin({
      referrals: this.getReferrals({ page, pageSize }),
      profile: this.keycloak.loadUserProfile(),
    }).pipe(
      switchMap(({ referrals, profile }) =>
        this.referralsMapperService.mapReferrals(referrals, profile)
      )
    );
  }

  getReferrals({
    page = 0,
    pageSize = 10,
  }): Observable<PagedResult<RESTReferral>> {
    const params = new HttpParams().set('PageSize', pageSize).set('Page', page);
    return this.get<PagedResult<RESTReferral>>('', params);
  }

  getReferralById(referralId: number): Observable<Referral> {
    return forkJoin({
      referral: this.get<RESTReferral>(referralId),
      profile: this.keycloak.loadUserProfile(),
    }).pipe(
      switchMap(({ referral, profile }) =>
        this.referralsMapperService.mapReferral(referral, profile)
      )
    );
  }

  postReferral(referral: Referral): Observable<ReferralResponse> {
    return this.post('', this.referralsMapperService.mapPostReferral(referral));
  }
}
