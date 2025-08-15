import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';
import { Referral } from './referrals.interfaces';
import { ApiResponse } from '../../core/models/api-response.model';
import { PagedResult } from '../../core/services/interfaces/page.type';
import { BaseApiService } from '../../core/services/api/base-api.service';

@Injectable({
  providedIn: 'root',
})
export class ReferralsService extends BaseApiService {
  protected resource = 'referrals';

  getReferrals() {
    // TODO: Remove fake response and return the right call to referrals API.
    return of<ApiResponse<PagedResult<Referral>>>({
      body: {
        count: 0,
        items: [],
      },
      success: true,
      message: 'Success',
      validationErrors: [],
    }).pipe(
      map<ApiResponse<PagedResult<Referral>>, Referral[]>(
        response => response.body.items || []
      )
    );
  }
}
