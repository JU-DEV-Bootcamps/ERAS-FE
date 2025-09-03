import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import { Referral } from '../models/referrals.interfaces';
import { ApiResponse } from '@core/models/api-response.model';
import { PagedResult } from '@core/services/interfaces/page.type';

import { BaseApiService } from '@core/services/api/base-api.service';
import { HttpParams } from '@angular/common/http';

const referralsMock: Referral[] = [
  {
    id: 1,
    date: '2025-07-17T16:01:06.351633Z',
    submitter: 'Pablo',
    service: 'Student Services',
    professional: 'Master',
    student: 'Jane doe',
    comment:
      'Se realizó evaluación inicial. Se programan 3 sesiones y seguimiento quincenal.',
    status: 'created',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ReferralsService extends BaseApiService {
  protected resource = 'remissions';

  getReferrals({ page = 0, pageSize = 10 }) {
    const params = new HttpParams().set('PageSize', pageSize).set('Page', page);
    return this.get<ApiResponse<PagedResult<Referral>>>('', params).pipe(
      map<ApiResponse<PagedResult<Referral>>, Referral[]>(
        response => response.body?.items || []
      )
    );
  }

  getReferralById(referralId: number): Observable<Referral> {
    const referral = referralsMock.find(referral => referral.id === referralId);
    return of(referral as Referral);
  }
}
